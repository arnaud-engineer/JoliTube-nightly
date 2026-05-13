import { logger } from "../core/logger.js";
import { eventBus } from "../core/eventBus.js";
import { channelEngine } from "../channels/ChannelEngine.js";
import { KeyboardController } from "../input/keyboardController.js";
import { installLegacyCommandAdapter } from "../legacy/legacyCommandAdapter.js";

/*
 * JoliTube runtime bootstrap.
 *
 * This file progressively initializes the modular runtime layer
 * alongside the historical legacy runtime.
 *
 * Important:
 * the bootstrap must remain non-destructive.
 */

function bootstrapRuntime() {
    if (window.__JOLITUBE_RUNTIME_BOOTSTRAPPED__) {
        return;
    }

    window.__JOLITUBE_RUNTIME_BOOTSTRAPPED__ = true;

    logger.info("Bootstrapping modular runtime layer");

    channelEngine.initialize();
    window.__JOLITUBE_CHANNEL_ENGINE__ = channelEngine;

    installLegacyCommandAdapter();

    const keyboardController = new KeyboardController();
    keyboardController.start();

    eventBus.on("input:toggle-playback", () => {
        logger.debug("input:toggle-playback");
    });

    eventBus.on("input:zap-next", () => {
        logger.debug("input:zap-next");
    });

    eventBus.on("input:zap-previous", () => {
        logger.debug("input:zap-previous");
    });

    window.JoliTubeRuntime = {
        ...(window.JoliTubeRuntime || {}),
        keyboardController,
        channelEngine,
        eventBus,
        logger,
    };

    logger.info("Modular runtime layer ready");
}

bootstrapRuntime();
