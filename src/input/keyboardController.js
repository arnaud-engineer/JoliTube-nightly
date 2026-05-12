import { eventBus } from "../core/eventBus.js";

/*
 * Keyboard controller shell.
 *
 * Goal:
 * progressively isolate keyboard behavior from the legacy runtime.
 *
 * This file intentionally does not replace the old system yet.
 */

export class KeyboardController {
    constructor() {
        this.enabled = true;
        this.boundHandler = this.handleKeyDown.bind(this);
    }

    start() {
        window.addEventListener("keydown", this.boundHandler);
    }

    stop() {
        window.removeEventListener("keydown", this.boundHandler);
    }

    handleKeyDown(event) {
        if (!this.enabled) {
            return;
        }

        eventBus.emit("input:key", {
            key: event.key,
            code: event.code,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
        });

        switch(event.code) {
            case "ArrowUp":
                eventBus.emit("input:volume-up");
                break;

            case "ArrowDown":
                eventBus.emit("input:volume-down");
                break;

            case "ArrowRight":
                eventBus.emit("input:zap-next");
                break;

            case "ArrowLeft":
                eventBus.emit("input:zap-previous");
                break;

            case "Space":
                eventBus.emit("input:toggle-playback");
                break;
        }
    }
}
