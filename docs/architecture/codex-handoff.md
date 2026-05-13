# Codex Handoff

## Context

This repository contains an experimental refactor of JoliTube navigation logic.

The project historically evolved organically around a giant legacy `script.js` file.

Recent work introduced a first dedicated navigation module:

```text
src/player/navigation.js
```

The purpose is to progressively stabilize player behavior before larger architectural extraction.

## Current situation

The previous stabilization pass significantly improved behavior:

- playlist races reduced
- state convergence improved
- history navigation now mostly works
- NEXT / PREVIOUS became traceable through logs
- duplicate history entries are deduplicated

However, remaining bugs still exist around transitions.

## Important conceptual realization

Three distinct systems were historically mixed together:

1. Native YouTube playlist state
2. Random playlist generation (`randomPlaylist`)
3. Actual user navigation history

The current architecture direction is:

```text
navigationHistory = authoritative
YouTube iframe = playback backend only
```

## Important files

Main files involved:

```text
src/player/navigation.js
script.js
```

Most current navigation logic lives in `navigation.js`, but `script.js` still contains legacy state mutations.

## Current remaining problems

### Q/A navigation instability

Likely caused by synchronization happening during transitions.

### Previous button greyed out

Likely caused by UI depending on playlist state instead of history state.

### Channel switch replaying stale playlist state

Likely caused by stale iframe state during BUFFERING/UNSTARTED transitions.

## Current planned fix

Introduce:

```js
app.navigationTransition
```

Expected behavior:

### Before changing channel

```js
app.navigationTransition = true;
setPlaylistReady(false);
resetRuntimeVideoState();
```

### During transition

Ignore synchronization attempts from:

- BUFFERING
- UNSTARTED
- early PAUSED states

### Unlock transition only after

```text
PLAYING
AND valid playlist
AND valid video id
```

Then:

```js
app.navigationTransition = false;
```

## Important invariant

Do NOT trust the YouTube iframe as authoritative state during transitions.

The app state should converge after stabilization, not mirror the iframe continuously.

## Logging

Recent refactors added significantly improved logging.

The logs are now reliable enough to trace:

- history pushes
- cursor movement
- playlist readiness
- synchronization timing
- channel transitions

The current system is imperfect but observable.

This is a major improvement over the previous state where races were effectively opaque.
