/*
 * YouTubeBackend
 *
 * Low-level YouTube iframe backend abstraction.
 *
 * Goal:
 * isolate direct YouTube player API interactions.
 *
 * Future responsibilities:
 * - load video
 * - play / pause
 * - seek
 * - mute
 * - volume
 * - playback rate
 * - quality
 * - captions
 * - YouTube event callbacks
 *
 * IMPORTANT:
 * This layer should NOT decide:
 * - which channel is active
 * - which video comes next
 * - playlist logic
 * - TV behavior
 *
 * Those responsibilities belong to PlaybackEngine and ChannelEngine.
 */

export class YouTubeBackend {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
    }
}

export const youtubeBackend = new YouTubeBackend();
