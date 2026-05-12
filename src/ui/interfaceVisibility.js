/*
 * Interface visibility controller.
 *
 * Goal:
 * progressively isolate inactivity-driven UI behavior
 * from the legacy monolithic runtime.
 *
 * This file currently acts as a compatibility shell.
 */

export class InterfaceVisibilityController {
    constructor({
        interfaceElement,
        hiddenClass = "hidden",
    }) {
        this.interfaceElement = interfaceElement;
        this.hiddenClass = hiddenClass;

        this.visible = true;
        this.hideTimer = null;
    }

    show() {
        this.visible = true;

        if (this.interfaceElement) {
            this.interfaceElement.classList.remove(this.hiddenClass);
        }
    }

    hide() {
        this.visible = false;

        if (this.interfaceElement) {
            this.interfaceElement.classList.add(this.hiddenClass);
        }
    }

    clearHideTimer() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    scheduleHide(delay = 3000) {
        this.clearHideTimer();

        this.hideTimer = setTimeout(() => {
            this.hide();
        }, delay);
    }
}
