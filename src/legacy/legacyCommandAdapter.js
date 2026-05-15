import { eventBus } from "../core/eventBus.js";
import { logger } from "../core/logger.js";
import { channelEngine } from "../channels/ChannelEngine.js";
import { channelUiController } from "../channels/ChannelUiController.js";
import { alertController } from "../ui/alerts/AlertController.js";
import { feedbackController } from "../ui/feedback/FeedbackController.js";
import { playerControlsController } from "../playback/PlayerControlsController.js";

/*
 * Legacy command adapter.
 *
 * This adapter lets the new modular runtime command the legacy app
 * without duplicating legacy implementation details.
 *
 * Events marked source: "legacy" are ignored defensively for compatibility
 * with older bridges that may still emit mirrored commands.
 */

function showAlert(title, description) {
    alertController.show(title, description);
}

function handleLegacyEscape() {
    const searchBar = document.getElementById("searchBar");

    if (searchBar && document.activeElement === searchBar) {
        channelUiController.searchReset();
        searchBar.blur();
        channelUiController.exitSearchMode();
        return;
    }

    if (window.app?.searchSingleton === true) {
        channelUiController.exitSearchMode();
    }
}

function displayChannelDigitFeedback(displayValue) {
    feedbackController.show("channelNumFeedback", displayValue);
}

function handleReservedChannelZero() {
    /*
     * Channel 00 is intentionally reserved for a future JoliTube-specific action.
     * For now it behaves like an invalid channel, but the branch is explicit so
     * it can later become home/random/mosaic/easter-egg behavior without digging
     * through generic validation code.
     */
    showAlert("Chaîne inexistante", "La chaîne 00 est réservée mais pas encore disponible.");
}

function handleInvalidChannel(channelNumber) {
    const displayChannel = String(channelNumber).padStart(2, "0");
    showAlert("Chaîne inexistante", `La chaîne ${displayChannel} n'existe pas encore.`);
}

function commitLegacyChannelDigitBuffer() {
    const rawBuffer = window.app?.remoteDigitBuffer;
    const selectedChannel = channelEngine.normalizeChannelNumber(rawBuffer);

    window.app.remoteDigitBuffer = null;
    window.app.remoteDigitSingleton = false;

    if (selectedChannel === null) {
        return;
    }

    if (channelEngine.isReservedChannelNumber(selectedChannel)) {
        handleReservedChannelZero();
        return;
    }

    if (!channelEngine.channelExists(selectedChannel)) {
        handleInvalidChannel(selectedChannel);
        return;
    }

    logger.debug(`Command → ChannelUiController.requestChannelLoad ${selectedChannel}`);
    channelUiController.requestChannelLoad(selectedChannel);
}

function handleLegacyChannelDigit(digit) {
    /*
     * Recreates the old TV-remote style channel selector.
     *
     * Digits are physical top-row keys handled by KeyboardController.
     * A single digit waits briefly for a possible second digit.
     * Two digits are committed immediately.
     *
     * Examples:
     * - 5      → shows 05, then loads channel 5 after timeout
     * - 1 + 2  → shows 12, then loads channel 12 immediately
     *
     * TODO: if JoliTube reaches 100+ channels, this two-digit input model must
     * become configurable or support a third digit before committing.
     */
    if (!window.app) {
        return;
    }

    const cleanDigit = String(digit ?? "").replace(/\D/g, "");

    if (cleanDigit.length !== 1) {
        return;
    }

    if (window.app.remoteDigitBuffer === null || window.app.remoteDigitBuffer === undefined) {
        window.app.remoteDigitBuffer = cleanDigit;
    } else {
        window.app.remoteDigitBuffer = `${window.app.remoteDigitBuffer}${cleanDigit}`.slice(-2);
    }

    const displayValue = window.app.remoteDigitBuffer.padStart(2, "0");
    displayChannelDigitFeedback(displayValue);

    if (window.app.remoteDigitSingleton) {
        window.clearTimeout(window.app.remoteDigitSingleton);
    }

    if (window.app.remoteDigitBuffer.length >= 2) {
        commitLegacyChannelDigitBuffer();
        return;
    }

    window.app.remoteDigitSingleton = window.setTimeout(() => {
        commitLegacyChannelDigitBuffer();
    }, 1200);
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

        logger.debug("Command → PlayerControlsController.playOrPause");
        playerControlsController.playOrPause();
    });

    eventBus.on("input:seek-forward", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.forwardInVideo");
        playerControlsController.forwardInVideo();
    });

    eventBus.on("input:seek-backward", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.backwardInVideo");
        playerControlsController.backwardInVideo();
    });

    eventBus.on("input:toggle-fullscreen", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController fullscreen toggle");
        playerControlsController.toggleFullscreenControl();
    });

    eventBus.on("input:toggle-mute", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.muteOrUnmute");
        playerControlsController.muteOrUnmute();
    });

    eventBus.on("input:volume-up", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.increaseVolume");
        playerControlsController.increaseVolume();
    });

    eventBus.on("input:volume-down", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.decreaseVolume");
        playerControlsController.decreaseVolume();
    });

    eventBus.on("input:channel-previous", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → ChannelUiController.loadPreviousVisibleChannel");
        channelUiController.loadPreviousVisibleChannel();
    });

    eventBus.on("input:channel-next", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → ChannelUiController.loadNextVisibleChannel");
        channelUiController.loadNextVisibleChannel();
    });

    eventBus.on("input:channel-digit", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug(`Command → legacy channel digit ${payload?.digit}`);
        handleLegacyChannelDigit(payload?.digit);
    });

    eventBus.on("input:focus-search", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → ChannelUiController.focusSearch");
        channelUiController.focusSearch();
    });

    eventBus.on("input:toggle-theater-mode", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController theater/fill toggle");
        playerControlsController.toggleTheaterMode();
    });

    eventBus.on("input:next-speed", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.nextSpeed");
        playerControlsController.nextSpeed();
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

        logger.debug("Command → PlayerControlsController.nextVideo");
        playerControlsController.nextVideo();
    });

    eventBus.on("input:zap-previous", (payload) => {
        if (shouldIgnore(payload)) {
            return;
        }

        logger.debug("Command → PlayerControlsController.previousVideo");
        playerControlsController.previousVideo();
    });

    logger.info("Legacy command adapter installed");
}
