# script.js mapping (work in progress)

This document exists because the current runtime logic is heavily centralized.

The goal is to progressively identify responsibility zones before extraction.

---

# Identified responsibility groups

## Player runtime

Likely responsibilities:

- YouTube iframe initialization
- video loading
- play/pause state
- quality selection
- subtitles handling
- autoplay management
- video end behavior
- buffering state

Future target:

```txt
src/player/
```

---

## Channel runtime

Likely responsibilities:

- channel switching
- playlist randomization
- playlist loading
- curator metadata
- current channel state

Future target:

```txt
src/channels/
```

---

## UI visibility system

Likely responsibilities:

- cursor hiding
- interface fade out
- inactivity detection
- overlays
- feedback popups
- fullscreen behavior

Future target:

```txt
src/ui/
```

---

## Keyboard and remote behavior

Likely responsibilities:

- shortcuts
- navigation
- zapping
- volume controls
- fullscreen shortcuts
- search behavior

Future target:

```txt
src/input/
```

---

## Runtime state

Current issue:

State appears spread between:

- globals
- DOM classes
- timers
- player state
- local variables

Future target:

```txt
src/core/
```

---

# Important note

This mapping is intentionally approximate at first.

The objective is NOT perfect architecture upfront.

The objective is reducing cognitive chaos progressively.
