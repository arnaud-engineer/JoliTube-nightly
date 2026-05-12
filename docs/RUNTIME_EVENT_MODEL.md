# JoliTube Runtime Event Model

This document describes the probable event-oriented architecture already implicitly present in the legacy runtime.

The objective is NOT to impose a framework.

The objective is to progressively replace hidden coupling with explicit event flows.

---

# Why this matters

The current legacy runtime often communicates through:

- mutable globals
- timers
- DOM classes
- player polling
- side effects

Example of implicit coupling:

```txt
keyboard event
→ modifies app flag
→ timer notices state
→ DOM changes
→ another runtime branch reacts
```

The future architecture should progressively move toward:

```txt
keyboard event
→ emits explicit runtime event
→ interested systems react independently
```

---

# Probable runtime events

## Player events

```txt
player:ready
player:playing
player:paused
player:buffering
player:ended
player:error
player:seeked
```

---

## Interface events

```txt
ui:show
ui:hide
ui:activity
ui:inactive
ui:fullscreen-enter
ui:fullscreen-exit
```

---

## Channel events

```txt
channel:changed
channel:loading
channel:ready
```

---

## Video events

```txt
video:loading
video:ready
video:changed
video:unavailable
```

---

## Input events

```txt
input:key
input:mouse-move
input:zap-next
input:zap-previous
```

---

# Important architectural principle

The runtime should progressively move toward:

```txt
systems reacting to events
```

instead of:

```txt
systems inspecting each other's internal state constantly
```

---

# Critical warning

JoliTube contains many timing-sensitive behaviors.

Events should NOT destroy:

- interface rhythm
- passive TV feeling
- zapping continuity
- timing perception
- fullscreen immersion

The objective is stabilization.

Not sterilization.
