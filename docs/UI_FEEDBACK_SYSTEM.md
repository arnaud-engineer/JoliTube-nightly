# JoliTube UI feedback system

This document describes the temporary UI messages used by JoliTube and the planned split from the legacy runtime.

## Existing families

### Broadcast alerts

Current legacy entry point: `displayAlert(title, description)`.

Used for important messages such as invalid channels, finished playlists, or future player errors.

These alerts are large, highly visible, and should stay rare.

### HUD feedback

Current legacy entry points: `showFeedback(...)` and `hideFeedback(...)`.

Used for quick user-action confirmations such as channel number input. Existing DOM targets also include volume and mute feedback.

These feedbacks are small, temporary, and non-blocking.

## Planned modules

```txt
src/ui/alerts/AlertController.js
src/ui/feedback/FeedbackController.js
```

`AlertController` should own alert display, timers, and singleton behavior.

`FeedbackController` should own channel, volume, mute, and later speed/quality/subtitle HUD feedback.

## Migration rule

Do not redesign the visual behavior yet. First extract the existing behavior behind small controllers, then migrate calls progressively.

## Future ideas

Possible future HUD feedback: playback speed, quality, subtitles, buffering state, player errors, channel info, special channel 00 action.
