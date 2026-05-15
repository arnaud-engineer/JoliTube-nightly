/*
 * DebugOverlay
 *
 * Temporary runtime observability tool.
 *
 * Goal:
 * make the historical desynchronization between the JoliTube editorial state
 * and the real YouTube playback state visible while refactoring.
 *
 * This module is intentionally:
 * - lightweight
 * - non-interactive
 * - easy to remove later
 * - safe when player/app are not ready yet
 */

export class DebugOverlay {
    constructor({
        enabled = true,
        refreshInterval = 250,
        elementId = "jt-debug-overlay",
    } = {}) {
        this.enabled = enabled;
        this.refreshInterval = refreshInterval;
        this.elementId = elementId;
        this.interval = null;
    }

    start() {
        if (!this.enabled || this.interval) {
            return;
        }

        this.createOverlay();

        this.interval = window.setInterval(() => {
            this.refresh();
        }, this.refreshInterval);
    }

    stop() {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
        }

        const overlay = this.getOverlay();

        if (overlay) {
            overlay.remove();
        }
    }

    getOverlay() {
        return document.getElementById(this.elementId);
    }

    createOverlay() {
        if (this.getOverlay()) {
            return;
        }

        const overlay = document.createElement("div");

        overlay.id = this.elementId;
        overlay.style.position = "fixed";
        overlay.style.right = "10px";
        overlay.style.bottom = "10px";
        overlay.style.zIndex = "999999";
        overlay.style.background = "rgba(0, 0, 0, 0.82)";
        overlay.style.color = "#00ff90";
        overlay.style.padding = "12px";
        overlay.style.fontFamily = "monospace";
        overlay.style.fontSize = "12px";
        overlay.style.lineHeight = "1.35";
        overlay.style.border = "1px solid #00ff90";
        overlay.style.borderRadius = "6px";
        overlay.style.maxWidth = "360px";
        overlay.style.pointerEvents = "none";
        overlay.style.whiteSpace = "nowrap";

        document.body.appendChild(overlay);
    }

    safeRead(callback, fallback = "ERR") {
        try {
            const value = callback();
            return value ?? "null";
        } catch (error) {
            return fallback;
        }
    }

    refresh() {
        const overlay = this.getOverlay();

        if (!overlay) {
            return;
        }

        const appState = window.app;
        const player = window.player;
        const channelEngine = window.JoliTubeRuntime?.channelEngine;

        const currentVideoIndex = this.safeRead(() => appState.currentVideoIndex);
        const youtubePlaylistIndex = this.safeRead(() => player.getPlaylistIndex());
        const alreadyPlayedHead = this.safeRead(() => appState.alreadyPlayed?.[0]);
        const randomPlaylistHead = this.safeRead(() => appState.randomPlaylist?.[0]);
        const channelEngineCurrent = this.safeRead(() => channelEngine?.peekCurrentVideoIndex?.());
        const channelEngineNext = this.safeRead(() => channelEngine?.peekNextVideoIndex?.());
        const videoYtId = this.safeRead(() => appState.videoYtId);
        const playing = this.safeRead(() => appState.playing);
        const playerState = this.safeRead(() => player.getPlayerState());

        const desyncMarker = String(currentVideoIndex) !== String(youtubePlaylistIndex)
            ? "⚠️"
            : "OK";

        overlay.innerHTML = `
            <strong>JoliTube Debug</strong><br>
            desync: ${desyncMarker}<br><br>
            app.currentVideoIndex: ${currentVideoIndex}<br>
            yt.getPlaylistIndex(): ${youtubePlaylistIndex}<br>
            alreadyPlayed[0]: ${alreadyPlayedHead}<br>
            randomPlaylist[0]: ${randomPlaylistHead}<br>
            ChannelEngine.current: ${channelEngineCurrent}<br>
            ChannelEngine.next: ${channelEngineNext}<br>
            app.videoYtId: ${videoYtId}<br>
            app.playing: ${playing}<br>
            yt.playerState: ${playerState}
        `;
    }
}

export const debugOverlay = new DebugOverlay();
