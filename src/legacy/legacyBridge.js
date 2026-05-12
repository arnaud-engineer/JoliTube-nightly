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
 * It observes and wraps selected global functions, emits explicit runtime
 * events, then delegates to the original implementation.
 */

function wrapGlobalFunction(functionName, eventName) {
    const originalFunction = window[functionName];

    if (typeof originalFunction !== "function") {
        logger.warn(`Legacy function not found: ${functionName}`);
        return;
    }

    window[functionName] = function wrappedLegacyFunction(...args) {
        eventBus.emit(eventName, {
            source: "legacy",
            functionName,
            args,
        });

        return originalFunction.apply(this, args);
    };
}

function installLegacyBridge() {
    if (window.__JOLITUBE_LEGACY_BRIDGE_INSTALLED__) {
        return;
    }

    window.__JOLITUBE_LEGACY_BRIDGE_INSTALLED__ = true;

    window.JoliTubeRuntime = {
        eventBus,
        logger,
    };

    wrapGlobalFunction("showInterface", "ui:show-requested");
    wrapGlobalFunction("hideInterface", "ui:hide-requested");
    wrapGlobalFunction("playOrPause", "player:toggle-requested");
    wrapGlobalFunction("nextVideo", "input:zap-next");
    wrapGlobalFunction("previousVideo", "input:zap-previous");

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
