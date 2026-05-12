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
 * Important:
 * Letter shortcuts are matched by event.key, not only event.code.
 * This keeps shortcuts semantic on AZERTY layouts where the physical key code
 * can differ from the displayed letter. Example: the French M key may not emit
 * code === "KeyM".
 */

const MIGRATED_CODES = new Set([
    "ArrowLeft",
    "ArrowRight",
    "Escape",
    "Space",
]);

const MIGRATED_KEYS = new Set([
    "a",
    "f",
    "m",
    "n",
    "p",
    "q",
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

            case "Escape":
                eventBus.emit("input:escape", { source: "modern-keyboard" });
                return;

            case "Space":
                eventBus.emit("input:toggle-playback", { source: "modern-keyboard" });
                return;
        }

        switch(key) {
            case "a":
                eventBus.emit("input:volume-down", { source: "modern-keyboard" });
                break;

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

            case "q":
                eventBus.emit("input:volume-up", { source: "modern-keyboard" });
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
