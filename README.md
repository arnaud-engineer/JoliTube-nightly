# JoliTube Nightly

JoliTube Nightly is the experimental version of JoliTube: a curated, TV-like YouTube experience built around channels, zapping, remote-control style navigation, and a custom fullscreen player interface.

The current codebase is a legacy vanilla JavaScript prototype. It works as a compact static web app, but most of the behavior is still concentrated in a few global files. A `legacy` branch has been created as a safety snapshot before refactoring `main`.

## Current architecture

```txt
index.html      Static HTML shell and UI markup
data.js         Channel list, curator list, player constants
script.js       Main application logic, YouTube iframe handling, UI behavior
style.css       Visual identity and layout
rsrc/           Logos, icons, images and player assets
```

## Project intent

JoliTube is not meant to be a generic video platform. The goal is closer to a fictional cable-TV interface for YouTube playlists:

- curated thematic channels
- passive watching and zapping
- keyboard / remote-control style controls
- fullscreen-first experience
- minimal backend and no YouTube Data API key requirement
- strong retro-TV / old-web visual identity

## Important technical note

The project intentionally uses the YouTube iframe player as a controllable black box rather than relying on the YouTube Data API. This avoids API keys, quota handling and backend complexity, but it also means the player layer has to deal with iframe-specific quirks: delayed metadata, unstable state transitions, captions loading, quality levels, unavailable videos and browser autoplay behavior.

A major refactor should isolate those quirks inside a dedicated player adapter instead of letting the whole app depend directly on `YT.Player` behavior.

## Refactor direction

The first objective is not to rewrite everything. The first objective is to make the existing behavior understandable and safer to change.

Expected direction:

```txt
src/
  core/          Shared state, events and app lifecycle
  player/        YouTube iframe adapter and normalized player API
  ui/            Controls, channel menu, feedback, visibility behavior
  data/          Channel and curator definitions
  legacy/        Temporary helpers while migrating old code
```

Probable first modules:

- `youtubePlayerAdapter.js`
- `appState.js`
- `channelRepository.js`
- `playlistRuntime.js`
- `interfaceVisibility.js`
- `keyboardController.js`

## Current priorities

1. Preserve the working legacy behavior.
2. Document what the current code is doing before moving it.
3. Extract the YouTube player logic behind a small local API.
4. Separate data from runtime state.
5. Reduce direct global DOM manipulation over time.
6. Keep the project lightweight and vanilla JS unless a dependency is clearly justified.

## Non-goals for now

- No React/Vue/Svelte migration by default.
- No backend unless the feature genuinely requires one.
- No YouTube Data API dependency unless it solves a concrete problem that cannot reasonably be handled from the iframe player.
- No big-bang rewrite.

## Safety branches

```txt
legacy  Snapshot of the old working code before refactor
main    Active experimental branch
```
