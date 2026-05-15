import { eventBus } from "../core/eventBus.js";
import { logger } from "../core/logger.js";

/*
 * Legacy runtime bridge.
 *
 * This is the first real connection between the historical global runtime
 * and the new modular architecture.
 *
 * Important rule:
 * this bridge must preserve legacy behavior.
 *
 * It exposes shared runtime services to the older non-module script while the
 * remaining legacy pieces are moved into modules.
 */

function installLegacyBridge() {
    if (window.__JOLITUBE_LEGACY_BRIDGE_INSTALLED__) {
        return;
    }

    window.__JOLITUBE_LEGACY_BRIDGE_INSTALLED__ = true;

    window.JoliTubeRuntime = {
        ...(window.JoliTubeRuntime || {}),
        eventBus,
        logger,
    };

    eventBus.on("ui:show-requested", () => {
        logger.debug("ui:show-requested");
    });

    eventBus.on("ui:hide-requested", () => {
        logger.debug("ui:hide-requested");
    });

    eventBus.on("player:toggle-requested", () => {
        logger.debug("player:toggle-requested");
    });

    logger.info("Legacy bridge installed");
}

installLegacyBridge();
