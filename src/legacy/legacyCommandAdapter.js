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

function callLegacyFunction(functionName, ...args) {
    const legacyFunction = window[functionName];

    if (typeof legacyFunction !== "function") {
        logger.warn(`Cannot execute legacy command, missing function: ${functionName}`);
        return;
    }

    legacyFunction(...args);
}

function toggleLegacyPlayback() {
    if (window.app?.playing === true) {
        callLegacyFunction("pauseChannel");
    } else {
        callLegacyFunction("playChannel");
    }
}

function toggleLegacyFullscreen() {
    if (window.app?.fullscreenStatus === true) {
        callLegacyFunction("endFullScreen");
    } else {
        callLegacyFunction("goFullScreen");
    }
}

function toggleLegacyMute() {
    if (!window.app) {
        callLegacyFunction("muteOrUnmute");
        return;
    }

    window.app.muteOn = !window.app.muteOn;
    callLegacyFunction("refreshVolume");
}

function toggleLegacyTheaterMode() {
    if (window.app?.theaterOn === true) {
        callLegacyFunction("goFillMode");
    } else {
        callLegacyFunction("goTheatherMode");
    }
}

function handleLegacyEscape() {
    const searchBar = document.getElementById("searchBar");

    if (searchBar && document.activeElement === searchBar) {
        searchBar.value = "";

        if (typeof window.searchUpdate === "function") {
            window.searchUpdate();
        }

        searchBar.blur();
        callLegacyFunction("quitSearchMode");
        return;
    }

    if (window.app?.searchSingleton === true) {
        callLegacyFunction("quitSearchMode");
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

    eventBus.on("input:toggle-mute", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy mute toggle");
        toggleLegacyMute();
    });

    eventBus.on("input:volume-up", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy increaseVolume");
        callLegacyFunction("increaseVolume");
    });

    eventBus.on("input:volume-down", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy decreaseVolume");
        callLegacyFunction("decreaseVolume");
    });

    eventBus.on("input:channel-previous", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy loadPreviousChannel");
        callLegacyFunction("loadPreviousChannel");
    });

    eventBus.on("input:channel-next", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy loadNextChannel");
        callLegacyFunction("loadNextChannel");
    });

    eventBus.on("input:channel-digit", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug(`Command → legacy channel digit ${payload?.digit}`);

        if (typeof window.remoteDigitInput === "function") {
            callLegacyFunction("remoteDigitInput", payload?.digit);
        }
    });

    eventBus.on("input:focus-search", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy searchMode");

        const searchBar = document.getElementById("searchBar");

        if (searchBar) {
            searchBar.focus();
        }

        callLegacyFunction("searchMode");
    });

    eventBus.on("input:toggle-theater-mode", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy theater/fill toggle");
        toggleLegacyTheaterMode();
    });

    eventBus.on("input:next-speed", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy nextSpeed");
        callLegacyFunction("nextSpeed");
    });

    eventBus.on("input:escape", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → legacy escape handling");
        handleLegacyEscape();
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
