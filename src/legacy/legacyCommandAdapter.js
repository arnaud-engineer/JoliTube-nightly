import { eventBus } from "../core/eventBus.js";
import { logger } from "../core/logger.js";

/*
 * Legacy command adapter.
 *
 * This adapter lets the new modular runtime command the legacy app
 * without duplicating legacy implementation details.
 *
 * Important:
 * The legacy bridge also emits events when legacy functions are called.
 * To avoid loops, this adapter ignores events coming from source: "legacy".
 */

function callLegacyFunction(functionName) {
    const legacyFunction = window[functionName];

    if (typeof legacyFunction !== "function") {
        logger.warn(`Cannot execute legacy command, missing function: ${functionName}`);
        return;
    }

    legacyFunction();
}

function shouldIgnore(payload) {
    return payload?.source === "legacy";
}

export function installLegacyCommandAdapter() {
    if (window.__JOLITUBE_LEGACY_COMMAND_ADAPTER_INSTALLED__) {
        return;
    }

    window.__JOLITUBE_LEGACY_COMMAND_ADAPTER_INSTALLED__ = true;

    eventBus.on("input:toggle-playback", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy playOrPause");
        callLegacyFunction("playOrPause");
    });

    eventBus.on("input:zap-next", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy nextVideo");
        callLegacyFunction("nextVideo");
    });

    eventBus.on("input:zap-previous", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy previousVideo");
        callLegacyFunction("previousVideo");
    });

    logger.info("Legacy command adapter installed");
}
