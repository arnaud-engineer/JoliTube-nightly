import { eventBus } from "../core/eventBus.js";

/*
 * Keyboard controller.
 *
 * Goal:
 * progressively isolate keyboard behavior from the legacy runtime.
 *
 * During migration, owned shortcuts must stop before reaching legacy/browser/player
 * keyboard handlers.
 */

const MIGRATED_KEYS = new Set([
    "ArrowLeft",
    "ArrowRight",
    "KeyA",
    "KeyF",
    "KeyM",
    "KeyN",
    "KeyP",
    "KeyQ",
    "KeyS",
    "KeyT",
    "KeyX",
    "Escape",
    "Space",
]);

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

        if (!MIGRATED_KEYS.has(event.code)) {
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
                break;

            case "ArrowLeft":
                eventBus.emit("input:seek-backward", { source: "modern-keyboard" });
                break;

            case "KeyA":
                eventBus.emit("input:volume-down", { source: "modern-keyboard" });
                break;

            case "KeyF":
                eventBus.emit("input:toggle-fullscreen", { source: "modern-keyboard" });
                break;

            case "KeyM":
                eventBus.emit("input:toggle-mute", { source: "modern-keyboard" });
                break;

            case "KeyN":
                eventBus.emit("input:zap-next", { source: "modern-keyboard" });
                break;

            case "KeyP":
                eventBus.emit("input:zap-previous", { source: "modern-keyboard" });
                break;

            case "KeyQ":
                eventBus.emit("input:volume-up", { source: "modern-keyboard" });
                break;

            case "KeyS":
                eventBus.emit("input:focus-search", { source: "modern-keyboard" });
                break;

            case "KeyT":
                eventBus.emit("input:toggle-theater-mode", { source: "modern-keyboard" });
                break;

            case "KeyX":
                eventBus.emit("input:next-speed", { source: "modern-keyboard" });
                break;

            case "Escape":
                eventBus.emit("input:escape", { source: "modern-keyboard" });
                break;

            case "Space":
                eventBus.emit("input:toggle-playback", { source: "modern-keyboard" });
                break;
        }
    }
}
