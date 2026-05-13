# Known Navigation Bugs

This file tracks known remaining navigation issues after the first stabilization refactor.

The goal is to avoid rediscovering already identified failure modes.

## QA navigation instability

### Symptoms

- Q / A channel navigation sometimes feels inconsistent
- channel switches can appear to replay old state
- previous playlist state may temporarily reappear

### Current hypothesis

Synchronization still happens too early during channel transitions.

Likely causes:

- stale iframe playlist state
- `syncPlayerState()` triggered during transitional states
- legacy code paths still mutating playback state directly

### Planned fix

Introduce:

```js
app.navigationTransition
```

and freeze synchronization during transitions.

---

## Previous button temporarily greyed out

### Symptoms

The PREVIOUS button may become disabled or greyed out even though history exists.

### Root cause

Legacy UI logic appears to derive button availability from playlist state instead of navigation history.

For example:

```text
playlistReady === false
```

currently disables navigation in some situations.

### Correct model

PREVIOUS availability should instead derive from:

```js
navigationHistory.length > 1
```

or:

```js
navigationCursor > 0
```

---

## Channel changes replay previous channel

### Symptoms

Changing channel may temporarily replay or expose the previous playlist.

### Root cause

The YouTube iframe may still expose stale playlist state during:

- BUFFERING
- UNSTARTED
- early PAUSED states

The app previously trusted those values too early.

### Current mitigation

`playlistReady`

### Planned stabilization

`navigationTransition`

---

## Random playlist inconsistencies

### Symptoms

- randomization history may not match user history
- replay order can appear incoherent

### Important clarification

This is mostly architectural, not a bug.

`randomPlaylist` currently answers:

```text
What random unseen item should play next?
```

But it is incorrectly reused in places that expect:

```text
What did the user actually watch?
```

These are separate concerns.

---

## Legacy script.js coupling

### Symptoms

Unexpected state mutations still happen.

### Root cause

Too much navigation logic still lives in `script.js`.

Even after introducing `navigation.js`, legacy functions continue to:

- mutate globals directly
- reset arrays
- partially synchronize state
- trigger playback side effects

### Long-term direction

Continue progressively extracting navigation responsibilities into:

```text
src/player/navigation.js
```

until `script.js` becomes mostly orchestration/UI glue.
