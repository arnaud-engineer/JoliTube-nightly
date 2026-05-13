/*
 * ChannelEngine
 *
 * Editorial / programming layer.
 *
 * Goal:
 * decide WHAT should be played.
 *
 * Current migration scope:
 * - own channel catalog access
 * - own channel validation
 * - own playback queue structures
 * - own next/previous video selection
 * - provide safe facades over legacy channel loading functions
 *
 * The legacy runtime still owns actual playback execution.
 */

export class ChannelEngine {
    constructor({ channelListProvider = () => window.channelList } = {}) {
        this.initialized = false;
        this.channelListProvider = channelListProvider;
    }

    initialize() {
        this.initialized = true;
    }

    /* ---------------------------------------------------------------------
     * Channel catalog
     * ------------------------------------------------------------------ */

    getChannelList() {
        const channelList = this.channelListProvider();

        if (!Array.isArray(channelList)) {
            return [];
        }

        return channelList;
    }

    getChannelCount() {
        return this.getChannelList().length;
    }

    normalizeChannelNumber(channelNumber) {
        const normalized = Number.parseInt(channelNumber, 10);

        if (!Number.isFinite(normalized)) {
            return null;
        }

        return normalized;
    }

    channelExists(channelNumber) {
        const normalized = this.normalizeChannelNumber(channelNumber);

        if (normalized === null) {
            return false;
        }

        return normalized >= 1 && normalized <= this.getChannelCount();
    }

    getChannelByNumber(channelNumber) {
        const normalized = this.normalizeChannelNumber(channelNumber);

        if (!this.channelExists(normalized)) {
            return null;
        }

        return this.getChannelList()[normalized - 1];
    }

    isReservedChannelNumber(channelNumber) {
        return this.normalizeChannelNumber(channelNumber) === 0;
    }

    /* ---------------------------------------------------------------------
     * Playback queue ownership
     * ------------------------------------------------------------------ */

    getRandomPlaylist() {
        return window.app?.randomPlaylist ?? [];
    }

    setRandomPlaylist(playlist) {
        if (!window.app) {
            return;
        }

        window.app.randomPlaylist = Array.isArray(playlist)
            ? playlist
            : [];
    }

    getAlreadyPlayed() {
        return window.app?.alreadyPlayed ?? [];
    }

    setAlreadyPlayed(history) {
        if (!window.app) {
            return;
        }

        window.app.alreadyPlayed = Array.isArray(history)
            ? history
            : [];
    }

    getVideoHistory() {
        return window.app?.videoHistory ?? [];
    }

    pushVideoHistory(entry) {
        if (!window.app) {
            return;
        }

        if (!Array.isArray(window.app.videoHistory)) {
            window.app.videoHistory = [];
        }

        window.app.videoHistory.push(entry);
    }

    hasNextVideo() {
        return this.getRandomPlaylist().length > 0;
    }

    hasPreviousVideo() {
        return this.getAlreadyPlayed().length > 1;
    }

    peekNextVideoIndex() {
        return this.getRandomPlaylist()[0] ?? null;
    }

    peekCurrentVideoIndex() {
        return this.getAlreadyPlayed()[0] ?? null;
    }

    getNextVideoIndex() {
        if (!this.hasNextVideo()) {
            return null;
        }

        const randomPlaylist = [...this.getRandomPlaylist()];
        const alreadyPlayed = [...this.getAlreadyPlayed()];

        const nextVideo = randomPlaylist.shift();

        alreadyPlayed.unshift(nextVideo);

        this.setRandomPlaylist(randomPlaylist);
        this.setAlreadyPlayed(alreadyPlayed);

        return nextVideo;
    }

    getPreviousVideoIndex() {
        if (!this.hasPreviousVideo()) {
            return null;
        }

        const randomPlaylist = [...this.getRandomPlaylist()];
        const alreadyPlayed = [...this.getAlreadyPlayed()];

        randomPlaylist.unshift(alreadyPlayed.shift());

        this.setRandomPlaylist(randomPlaylist);
        this.setAlreadyPlayed(alreadyPlayed);

        return alreadyPlayed[0] ?? null;
    }

    /* ---------------------------------------------------------------------
     * Transitional legacy facades
     * ------------------------------------------------------------------ */

    loadByNumber(channelNumber) {
        const normalized = this.normalizeChannelNumber(channelNumber);

        if (normalized === null) {
            return;
        }

        if (typeof window.loadSelectedChannel === "function") {
            window.loadSelectedChannel(normalized);
        }
    }

    loadNext() {
        if (typeof window.loadNextChannel === "function") {
            window.loadNextChannel();
        }
    }

    loadPrevious() {
        if (typeof window.loadPreviousChannel === "function") {
            window.loadPreviousChannel();
        }
    }
}

export const channelEngine = new ChannelEngine();
