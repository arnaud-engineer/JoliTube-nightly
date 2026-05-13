/*
 * ChannelEngine
 *
 * Editorial / programming layer.
 *
 * Goal:
 * decide WHAT should be played.
 *
 * Current first migration step:
 * - own channel catalog access
 * - own channel number validation
 * - provide safe facades around legacy channel loading functions
 *
 * The legacy runtime still owns the real player/channel loading implementation.
 */

export class ChannelEngine {
    constructor({ channelListProvider = () => window.channelList } = {}) {
        this.initialized = false;
        this.channelListProvider = channelListProvider;
    }

    initialize() {
        this.initialized = true;
    }

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

    loadByNumber(channelNumber) {
        /*
         * Transitional facade.
         *
         * ChannelEngine now owns the intent and validation boundary, but the
         * legacy runtime still performs the actual channel loading.
         */
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
