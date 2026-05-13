/*
 * PlaybackEngine
 *
 * TV-like playback orchestration layer.
 *
 * Goal:
 * coordinate playback intent between:
 * - channel engine
 * - UI/runtime
 * - video backend
 *
 * This layer should eventually own:
 * - autoplay transitions
 * - next/previous video flow
 * - end-of-video behavior
 * - playback state orchestration
 *
 * IMPORTANT:
 * This layer is intentionally minimal for now.
 * The legacy runtime still owns the actual playback implementation.
 */

export class PlaybackEngine {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
    }
}

export const playbackEngine = new PlaybackEngine();
