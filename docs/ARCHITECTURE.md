# JoliTube Nightly – Architecture Notes

## Current situation

The current application is effectively a monolith built around `script.js`.

This is not necessarily a bad thing historically: the project evolved organically around real UX experimentation instead of abstract architecture.

However, several concerns are now tightly coupled:

- YouTube iframe quirks
- player state
- runtime app state
- UI transitions
- keyboard interactions
- channel management
- DOM manipulation
- timers and async synchronization
- fullscreen / theater behavior

The goal is NOT to rewrite everything.

The goal is to progressively isolate unstable areas.

---

# Main technical problem

The app currently has many implicit dependencies.

Example:

```txt
player state
→ modifies DOM
→ modifies app flags
→ modifies timers
→ modifies interface visibility
→ modifies keyboard behavior
```

This makes the code difficult to reason about after long periods of inactivity.

---

# Refactor philosophy

## Keep

- Vanilla JS
- Static deployment
- Lightweight runtime
- Direct browser execution
- TV-like UX
- Curated channel approach
- Minimal dependencies

## Avoid

- Full rewrite
- Framework migration by default
- Build complexity for no reason
- Backend unless justified
- YouTube Data API dependency

---

# Priority extraction targets

## 1. YouTube adapter

The app should stop talking directly to `YT.Player` everywhere.

Target:

```js
player.load(videoId)
player.play()
player.pause()
player.seek(seconds)
player.setVolume(volume)
player.setCaptions(language)
player.on("ended", callback)
```

The adapter becomes the quarantine zone for:

- autoplay weirdness
- loading delays
- captions race conditions
- unavailable videos
- quality handling
- browser inconsistencies

---

## 2. App state

Current state is spread through dozens of mutable globals.

The objective is not immutable Redux-style architecture.

The objective is simply:

- know where state lives
- know who changes it
- reduce invisible side effects

---

## 3. Interface behavior

A lot of UI logic currently depends on nested timers.

The UI should progressively move toward explicit behavior modules:

```txt
interfaceVisibility.js
feedbackDisplay.js
keyboardNavigation.js
```

---

# Important warning

JoliTube already contains many subtle UX behaviors.

The project should not be rewritten blindly.

A bad refactor could easily destroy:

- zapping feel
- interface rhythm
- timing perception
- fullscreen behavior
- passive watching comfort
- retro-TV atmosphere

The objective is stabilization, not normalization.
