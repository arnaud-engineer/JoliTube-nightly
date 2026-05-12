import { eventBus } from "../core/eventBus.js";

/*
 * Keyboard controller.
 *
 * Goal:
 * progressively isolate keyboard behavior from the legacy runtime.
 *
 * During migration, owned shortcuts must stop before reaching legacy/browser/player
 * keyboard handlers.
 *
 * Shortcut philosophy, French AZERTY target for now:
 *
 * 1. YouTube-compatible / mnemonic media shortcuts use event.key.
 *    Example: M means the visible M key, even if its physical key code differs
 *    across AZERTY/QWERTY/QWERTZ layouts.
 *
 * 2. Spatial controls use event.code.
 *    Example: arrows, Space, Escape and number-row channel selection are physical
 *    controls rather than letters.
 *
 * 3. JoliTube-specific channel/menu navigation uses physical Q/A positions.
 *    This deliberately frees ArrowUp/ArrowDown for YouTube-like volume control.
 *
 * TODO: if JoliTube is later localized for non-AZERTY users, expose this mapping
 * as a configurable profile instead of hardcoding assumptions here.
 */

const MIGRATED_CODES = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Digit0",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "KeyA",
    "KeyQ",
    "Escape",
    "Space",
]);

const MIGRATED_KEYS = new Set([
    "f",
    "m",
    "n",
    "p",
    "s",
    "t",
    "x",
]);

function normalizedKey(event) {
    return event.key?.toLowerCase();
}

function isMigratedShortcut(event) {
    return MIGRATED_CODES.has(event.code) || MIGRATED_KEYS.has(normalizedKey(event));
}

function isEditableTarget(target) {
    if (!target) {
        return false;
    }

    const tagName = target.tagName?.toLowerCase();

    return target.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";
}

export class KeyboardController {
    constructor() {
        this.enabled = true;
        this.boundHandler = this.handleKeyDown.bind(this);
    }

    start() {
        window.addEventListener("keydown", this.boundHandler, { capture: true });
    }

    stop() {
        window.removeEventListener("keydown", this.boundHandler, { capture: true });
    }

    handleKeyDown(event) {
        if (!this.enabled) {
            return;
        }

        if (!isMigratedShortcut(event)) {
            return;
        }

        /*
         * Let form controls keep normal text/select behavior.
         * Escape remains owned so search/settings can be exited cleanly.
         */
        if (isEditableTarget(event.target) && event.code !== "Escape") {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const key = normalizedKey(event);

        eventBus.emit("input:key", {
            source: "modern-keyboard",
            key: event.key,
            code: event.code,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
        });

        switch(event.code) {
            case "ArrowRight":
                eventBus.emit("input:seek-forward", { source: "modern-keyboard" });
                return;

            case "ArrowLeft":
                eventBus.emit("input:seek-backward", { source: "modern-keyboard" });
                return;

            case "ArrowUp":
                eventBus.emit("input:volume-up", { source: "modern-keyboard" });
                return;

            case "ArrowDown":
                eventBus.emit("input:volume-down", { source: "modern-keyboard" });
                return;

            case "KeyQ":
                eventBus.emit("input:channel-previous", { source: "modern-keyboard" });
                return;

            case "KeyA":
                eventBus.emit("input:channel-next", { source: "modern-keyboard" });
                return;

            case "Escape":
                eventBus.emit("input:escape", { source: "modern-keyboard" });
                return;

            case "Space":
                eventBus.emit("input:toggle-playback", { source: "modern-keyboard" });
                return;
        }

        if (event.code?.startsWith("Digit")) {
            eventBus.emit("input:channel-digit", {
                source: "modern-keyboard",
                digit: event.code.replace("Digit", ""),
            });
            return;
        }

        switch(key) {
            case "f":
                eventBus.emit("input:toggle-fullscreen", { source: "modern-keyboard" });
                break;

            case "m":
                eventBus.emit("input:toggle-mute", { source: "modern-keyboard" });
                break;

            case "n":
                eventBus.emit("input:zap-next", { source: "modern-keyboard" });
                break;

            case "p":
                eventBus.emit("input:zap-previous", { source: "modern-keyboard" });
                break;

            case "s":
                eventBus.emit("input:focus-search", { source: "modern-keyboard" });
                break;

            case "t":
                eventBus.emit("input:toggle-theater-mode", { source: "modern-keyboard" });
                break;

            case "x":
                eventBus.emit("input:next-speed", { source: "modern-keyboard" });
                break;
        }
    }
}
