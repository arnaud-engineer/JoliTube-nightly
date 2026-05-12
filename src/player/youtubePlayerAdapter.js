/*
 * JoliTube Nightly
 * Experimental YouTube adapter layer
 *
 * Goal:
 * isolate direct YT.Player interactions behind a small local API.
 *
 * This file is intentionally minimal for now.
 *
 * It is NOT a rewrite.
 * It is a compatibility shell that will progressively absorb
 * YouTube-specific quirks from the legacy runtime.
 */

export class YouTubePlayerAdapter {
    constructor(playerInstanceGetter) {
        this.playerInstanceGetter = playerInstanceGetter;
        this.listeners = {};
    }

    getPlayer() {
        return this.playerInstanceGetter();
    }

    play() {
        try {
            this.getPlayer()?.playVideo();
        } catch(e) {
            console.error("[YouTubeAdapter] play failed", e);
        }
    }

    pause() {
        try {
            this.getPlayer()?.pauseVideo();
        } catch(e) {
            console.error("[YouTubeAdapter] pause failed", e);
        }
    }

    seek(seconds) {
        try {
            this.getPlayer()?.seekTo(seconds, true);
        } catch(e) {
            console.error("[YouTubeAdapter] seek failed", e);
        }
    }

    load(videoId) {
        try {
            this.getPlayer()?.loadVideoById(videoId);
        } catch(e) {
            console.error("[YouTubeAdapter] load failed", e);
        }
    }

    setVolume(volume) {
        try {
            this.getPlayer()?.setVolume(volume);
        } catch(e) {
            console.error("[YouTubeAdapter] volume failed", e);
        }
    }

    mute() {
        try {
            this.getPlayer()?.mute();
        } catch(e) {
            console.error("[YouTubeAdapter] mute failed", e);
        }
    }

    unmute() {
        try {
            this.getPlayer()?.unMute();
        } catch(e) {
            console.error("[YouTubeAdapter] unmute failed", e);
        }
    }

    getState() {
        try {
            return this.getPlayer()?.getPlayerState();
        } catch(e) {
            console.error("[YouTubeAdapter] state failed", e);
            return null;
        }
    }

    getCurrentTime() {
        try {
            return this.getPlayer()?.getCurrentTime();
        } catch(e) {
            console.error("[YouTubeAdapter] currentTime failed", e);
            return 0;
        }
    }

    getDuration() {
        try {
            return this.getPlayer()?.getDuration();
        } catch(e) {
            console.error("[YouTubeAdapter] duration failed", e);
            return 0;
        }
    }
}
