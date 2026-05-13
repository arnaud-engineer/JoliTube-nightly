# JoliTube Navigation Refactor

## Purpose

This document captures the current navigation refactor work so a future agent or developer can restart from the right mental model instead of rediscovering the same bugs from scratch.

JoliTube is currently moving away from a legacy player model where YouTube state, randomization state, UI state and user history were mixed together inside `script.js`.

The target is to make navigation deterministic, observable and progressively extractable from the large legacy `script.js` file.

## Root issue

The original navigation model mixed three different concepts:

1. Native YouTube playlist state
2. Shuffle/randomization state, mainly `randomPlaylist`
3. Real user navigation history, meaning what the user actually watched and in which order

Those systems used to overlap and fight each other. This caused:

- broken PREVIOUS behavior
- inconsistent NEXT behavior
- random history pollution across channels
- channel changes sometimes reusing stale YouTube state
- buttons becoming temporarily or permanently disabled incorrectly
- race conditions during `loadPlaylist()` and YouTube iframe transitions

## Key architectural decision

The source of truth should not be the YouTube iframe.

The authoritative user navigation model is now intended to be:

```js
app.navigationHistory = [];
app.navigationCursor = -1;
```

Each history entry should describe an actual user playback state:

```js
{
  channelNumber,
  channelName,
  playlistId,
  videoId,
  playlistIndex,
  playedAt,
  reason
}
```

YouTube should be treated as a playback backend / transport layer, not as the canonical application state.

## Current implemented foundation

The file `src/player/navigation.js` now contains the first real foundation for this model:

- `ensureNavigationHistory(app)`
- `pushHistoryEntry(app, entry, reason)`
- `pushCurrentPlaybackToHistory(app, player, reason)`
- `loadHistoryEntry(app, player, entry, reason)`
- `nextVideo(app, player)`
- `previousVideo(app, player)`
- `syncPlayerState(app, player, reason)`
- `setPlaylistReady(app, ready, reason)`
- `isPlaylistReady(app, player)`

This is still bridged into legacy code through globals because `script.js` is not yet modular.

## Current behavior target

The desired behavior is browser-like history:

```text
watch A
NEXT -> watch B
NEXT -> watch C
PREVIOUS -> B
PREVIOUS -> A
NEXT -> B again, if still in forward history
```

When the user branches from a previous point in history, forward history should be truncated.

## Important separation

`randomPlaylist` must not be considered navigation history.

It should only answer:

```text
What new random video should be proposed next for this channel?
```

It should not answer:

```text
Where was the user before?
```

or:

```text
Can the user go back?
```

Those are responsibilities of `navigationHistory` and `navigationCursor`.

## Legacy compatibility note

For now, `alreadyPlayed` is still mirrored from `navigationHistory` in some cases because legacy UI code in `script.js` still appears to derive button state from it.

This is temporary and should eventually be removed once UI state is derived from the new navigation model.

## Known risk

The new history model currently coexists with legacy state mutations from `script.js`.

This means the system can work better than before while still showing occasional weirdness, especially around:

- disabled / greyed buttons
- channel changes
- Q/A channel navigation
- repeated calls to `loadSelectedChannel()`

The next stabilization step is transition locking during channel changes.
