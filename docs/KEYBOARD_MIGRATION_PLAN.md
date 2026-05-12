# Keyboard migration strategy

## Current situation

Keyboard handling currently exists in two places:

```txt
Legacy:
<body onkeydown="keyHandler();">
```

and:

```txt
Modern runtime:
KeyboardController
→ eventBus
→ command adapters
```

This temporary overlap is intentional during migration.

---

# Migration goal

Final target:

```txt
KeyboardController
→ eventBus
→ modular systems
→ legacy adapter only where still needed
```

with:

```txt
keyHandler() removed
```

and:

```txt
no inline keyboard handlers in HTML
```

---

# Migration principles

## Do NOT rewrite behavior blindly

The current keyboard behavior contains many subtle UX assumptions.

The migration should preserve:

- zapping feel
- timing
- fullscreen behavior
- passive TV interaction model
- focus behavior
- search behavior

---

## One responsibility at a time

Recommended order:

1. play/pause
2. next/previous video
3. volume
4. fullscreen
5. search mode
6. subtitles
7. playback speed

---

# Critical risks

## Double-trigger behavior

Temporary overlap may produce:

```txt
keydown
→ legacy keyHandler()
→ modern KeyboardController
```

This can cause duplicate actions.

---

## Focus management

Keyboard behavior must eventually distinguish:

- normal playback mode
- search input focus
- settings selection
- subtitles selection

The legacy runtime likely handles part of this implicitly.

---

# Planned architecture

```txt
KeyboardController
→ emits normalized runtime events
→ systems react independently
```

Example:

```txt
Space
→ input:toggle-playback

ArrowRight
→ input:zap-next
```

This architecture allows future support for:

- remote controls
- mobile companion apps
- gamepads
- websocket control
- synchronized playback systems
