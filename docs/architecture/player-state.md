# Player State Model

## Why this document exists

Most historical JoliTube bugs were not caused by playlist logic itself.

They were caused by incorrect assumptions about when the YouTube iframe state becomes trustworthy.

This document explains the currently observed behavior.

## Important observation

The YouTube iframe API exposes transitional states that are not stable.

During those states:

- `getPlaylist()` may return an empty array
- `getPlaylistIndex()` may point to stale data
- `getVideoUrl()` may still reference the previous playlist
- `getPlayerState()` may not represent the real application state

This was the source of many race conditions.

## Relevant YouTube states

```text
-1 = UNSTARTED
 0 = ENDED
 1 = PLAYING
 2 = PAUSED
 3 = BUFFERING
```

The important detail:

The player often transitions through:

```text
PAUSED
UNSTARTED
BUFFERING
PLAYING
```

when changing playlist items or channels.

## Practical consequence

The application must not trust playlist state during:

- UNSTARTED
- BUFFERING
- early PAUSED during transitions

## Reliable convergence point

Current observations suggest state becomes mostly reliable only when:

```text
playerState === PLAYING
AND
playlist length > 0
AND
current video id is valid
```

This is why `syncPlayerState()` was changed to converge state mainly after confirmed PLAYING events.

## playlistReady

The boolean:

```js
app.playlistReady
```

was introduced to explicitly separate:

```text
iframe exists
```

from:

```text
playlist state is actually usable
```

This dramatically reduced race conditions.

## Remaining issue

A remaining class of bugs still exists during channel transitions because:

- legacy code may still attempt synchronization too early
- stale playlist state can still leak temporarily

## Planned solution

Introduce:

```js
app.navigationTransition
```

Behavior:

```text
Before changing channel:
- navigationTransition = true
- playlistReady = false
- runtime playback state reset

During transition:
- ignore synchronization attempts
- ignore stale iframe state

After confirmed PLAYING:
- navigationTransition = false
- sync authoritative state
```

## Important invariant

Never trust the YouTube iframe as source of truth during transitions.

The application state should converge FROM the iframe after stabilization, not continuously mirror it in real time.
