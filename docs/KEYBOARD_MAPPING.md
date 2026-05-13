# JoliTube keyboard mapping

This document describes the current keyboard control system and the UX decisions behind it.

The keyboard has been migrated away from the old global inline `keyHandler()` model. The current flow is:

```txt
KeyboardController
→ eventBus
→ legacyCommandAdapter
→ legacy runtime functions
```

The legacy runtime still performs the actual player/channel actions for now, but keyboard ownership now belongs to the modular runtime.

---

# Shortcut philosophy

JoliTube currently targets mostly French AZERTY users.

Keyboard handling deliberately mixes `event.code` and `event.key` depending on intent.

## 1. Spatial controls use `event.code`

These shortcuts are based on physical key position, not on the character produced by the keyboard layout.

Used for:

- arrows
- Space
- Escape
- number row channel selection
- numpad channel selection
- physical Q/A channel navigation

This is useful for controls that behave like remote-control buttons or physical navigation controls.

## 2. YouTube-like mnemonic controls use `event.key`

These shortcuts are based on the visible/typed letter.

Used for:

- M = mute
- F = fullscreen
- T = theater/fill mode
- X = speed
- N/P = next/previous video
- S = search

This keeps the behavior close to YouTube for users who already know YouTube shortcuts.

## 3. Future keyboard profiles

If JoliTube later targets non-AZERTY users seriously, this mapping should become configurable through keyboard profiles instead of being hardcoded.

---

# Current shortcuts

## YouTube-compatible player controls

| Shortcut | Action | Matching mode |
| --- | --- | --- |
| Space | Play / pause | `event.code` |
| ← | Seek backward | `event.code` |
| → | Seek forward | `event.code` |
| ↑ | Volume up | `event.code` |
| ↓ | Volume down | `event.code` |
| M | Mute / unmute | `event.key` |
| F | Fullscreen toggle | `event.key` |
| T | Theater / fill mode toggle | `event.key` |
| X | Next playback speed | `event.key` |

## JoliTube-specific controls

| Shortcut | Action | Matching mode |
| --- | --- | --- |
| N | Next video | `event.key` |
| P | Previous video | `event.key` |
| S | Focus channel search | `event.key` |
| Esc | Leave search / clear search context | `event.code` |
| Q | Previous channel / menu item | `event.code` |
| A | Next channel / menu item | `event.code` |
| 0–9 | TV-style channel number input | `event.code` |
| Numpad 0–9 | TV-style channel number input | `event.code` |

---

# Numeric channel input

The numeric channel input behaves like a TV remote.

Examples:

```txt
5
→ displays 05
→ waits briefly
→ loads channel 5

1 then 2
→ displays 12
→ loads channel 12 immediately
```

Invalid channel handling:

```txt
00
→ reserved for a future JoliTube action
→ currently displays a channel unavailable message

99 when channel 99 does not exist
→ displays a channel unavailable message
→ keeps the current channel playing
```

Important limitation:

```txt
The current system is intentionally two-digit only.
```

If JoliTube reaches 100+ channels, this behavior must be redesigned to support a third digit or a manual validation key.

---

# Legacy notes

The global legacy keyboard handler has been disconnected from `index.html`.

Some legacy keyboard-related helpers may still exist in `script.js`, especially around search input behavior. These should only remain if they are tied to a specific form field, such as `allowSearchInput()` on the search bar.

The goal is:

```txt
one global keyboard owner: KeyboardController
```

Field-specific input behavior may remain local when it is genuinely tied to that field.

---

# Known deferred topics

These are intentionally not handled right now:

- keyboard profiles for QWERTY/QWERTZ/non-French users
- gamepad support
- remote control support
- deep context-aware input system
- select quality/subtitle keyboard behavior, because this touches YouTube iframe/player quirks
