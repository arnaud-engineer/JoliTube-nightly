# JoliTube playback architecture

This document outlines the target split between the video backend, the JoliTube playback layer, the channel engine, and user state.

The current legacy runtime still mixes several responsibilities in `script.js`. The goal is to create clear module boundaries first, then progressively migrate behavior without rewriting everything at once.

---

# Target layers

## 1. VideoBackend

Technical video backend.

Current backend: YouTube iframe player.

Responsibilities:

- load one video
- play / pause
- seek
- volume
- mute
- playback rate
- quality
- captions
- player events

It should not decide which video should be played next.

---

## 2. PlaybackEngine

JoliTube playback experience.

Responsibilities:

- current playback intent
- play / pause orchestration
- next / previous video intent
- end-of-video behavior
- transition between videos
- coordination between channel decisions and video backend execution

It turns a low-level video backend into a TV-like player.

---

## 3. ChannelEngine

Editorial and channel programming layer.

Responsibilities:

- current channel
- channel selection
- next / previous channel
- channel number validation
- channel playlist state
- deciding which video should be played next
- randomization strategy
- already-played history
- backtracking history

It should decide what to play, but not directly implement video playback details.

Current observed legacy structures:

```js
app.randomPlaylist
app.alreadyPlayed
app.videoHistory
```

Those structures are currently mixed directly inside playback logic. They should progressively become owned by ChannelEngine.

---

## 4. UserState

Browser-local user state and preferences.

Future responsibilities:

- watched videos
- playback history persistence
- preferences
- last channel
- last volume
- future favorites / bookmarks

This is intentionally not implemented yet. It is documented now because watched-video logic will eventually belong here, not inside player code.

---

# Migration strategy

The migration should stay incremental.

Recommended order:

1. create module skeletons
2. move pure helpers first
3. create small facades over legacy functions
4. migrate one responsibility at a time
5. keep legacy compatibility until behavior is fully covered

Avoid large rewrites of player and channel code at once. The YouTube iframe player has timing quirks, so player behavior should be migrated carefully.

---

# Current state

Currently, `script.js` still owns most of the actual behavior.

The modular runtime already owns:

- keyboard input
- alerts
- feedback HUD
- basic channel catalog validation

The next phase is to progressively move playback/channel/user-state responsibilities into their own modules while keeping the legacy runtime working.
