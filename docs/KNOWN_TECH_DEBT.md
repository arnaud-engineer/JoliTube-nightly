# Known Technical Debt

This file documents intentionally known technical debt areas.

The objective is NOT shame.
The objective is avoiding invisible chaos.

---

# script.js monolith

## Current state

`script.js` currently acts as:

- application runtime
- player manager
- UI controller
- keyboard handler
- state container
- async synchronization layer
- fullscreen manager
- transition system
- playlist runtime

## Risk

High cognitive load.

High probability of hidden coupling.

---

# Global mutable state

The project currently relies heavily on mutable globals.

Examples:

- app.playing
- app.inputForbidden
- app.cursorOnInterface
- app.noUserInterraction
- app.hidingTimerOn

## Risk

- hidden side effects
- difficult debugging
- race conditions
- accidental desynchronization

---

# Timer-driven UI

Many UI behaviors rely on nested timers.

## Risk

- timing bugs
- inconsistent UI state
- browser-specific behavior
- hard-to-reproduce bugs

---

# Direct DOM manipulation

A large amount of runtime behavior directly manipulates DOM classes and inline styles.

## Risk

The DOM effectively becomes part of the application state.

---

# YouTube iframe coupling

The application currently depends directly on YouTube iframe behavior.

## Risk

- autoplay restrictions
- delayed metadata
- unavailable videos
- state inconsistencies
- caption timing problems

## Current mitigation strategy

Create a dedicated adapter layer.

---

# Positive note

A large part of this technical debt exists because the project prioritized:

- UX experimentation
- fast iteration
- atmosphere
- interaction feel
- creative direction

This debt should be stabilized progressively, not erased blindly.
