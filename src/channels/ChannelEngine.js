/*
 * ChannelEngine
 *
 * Editorial / programming layer.
 *
 * Goal:
 * decide WHAT should be played.
 *
 * Future responsibilities:
 * - current channel
 * - channel selection
 * - next/previous channel
 * - next video decision
 * - randomization
 * - playlist progression
 * - channel validation
 * - channel history
 *
 * IMPORTANT:
 * The legacy runtime still owns the real implementation for now.
 */

export class ChannelEngine {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        this.initialized = true;
    }
}

export const channelEngine = new ChannelEngine();
