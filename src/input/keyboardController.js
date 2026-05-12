import { eventBus } from "../core/eventBus.js";

/*
 * Keyboard controller.
 *
 * Goal:
 * progressively isolate keyboard behavior from the legacy runtime.
 *
 * During migration, some keyboard shortcuts are owned by this controller.
 * Those migrated shortcuts must stop before reaching legacy/browser/player
 * keyboard handlers.
 */

const MIGRATED_KEYS = new Set([
    "ArrowLeft",
    "ArrowRight",
    "KeyN",
    "KeyP",
    "Space",
]);

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

            case "KeyN":
                eventBus.emit("input:zap-next", { source: "modern-keyboard" });
                break;

            case "KeyP":
                eventBus.emit("input:zap-previous", { source: "modern-keyboard" });
                break;

            case "Space":
                eventBus.emit("input:toggle-playback", { source: "modern-keyboard" });
                break;
        }
    }
}
