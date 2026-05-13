/*
 * UserState
 *
 * Browser-local user persistence layer.
 *
 * Future responsibilities:
 * - watched videos
 * - playback history persistence
 * - last channel
 * - last volume
 * - preferences
 * - favorites / bookmarks
 *
 * This layer intentionally does NOT exist yet in the legacy runtime.
 *
 * It is introduced now because watched-video tracking and persistence
 * should eventually live here rather than inside playback/channel code.
 */

export class UserState {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
    }
}

export const userState = new UserState();
