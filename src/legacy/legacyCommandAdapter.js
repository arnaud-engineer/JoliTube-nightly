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

function toggleLegacyPlayback() {
    /*
     * Do not call playOrPause() from keyboard commands.
     *
     * Legacy playOrPause() contains UI/cursor guards that make sense for mouse
     * clicks but can block keyboard-driven playback when the interface is visible
     * or when focus is in a weird YouTube iframe state.
     */
    if (window.app?.playing === true) {
        callLegacyFunction("pauseChannel");
    } else {
        callLegacyFunction("playChannel");
    }
}

function toggleLegacyFullscreen() {
    /*
     * Do not call switchFullscreenMode() from keyboard commands.
     *
     * Legacy switchFullscreenMode() toggles fullscreen AND calls playOrPause(),
     * which changes playback state. The keyboard F command should only toggle
     * display mode and must preserve current playback.
     */
    if (window.app?.fullscreenStatus === true) {
        callLegacyFunction("endFullScreen");
    } else {
        callLegacyFunction("goFullScreen");
    }
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

        logger.debug("Command → legacy toggle playback");
        toggleLegacyPlayback();
    });

    eventBus.on("input:seek-forward", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy forwardInVideo");
        callLegacyFunction("forwardInVideo");
    });

    eventBus.on("input:seek-backward", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy backwardInVideo");
        callLegacyFunction("backwardInVideo");
    });

    eventBus.on("input:toggle-fullscreen", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy fullscreen toggle without playback change");
        toggleLegacyFullscreen();
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
