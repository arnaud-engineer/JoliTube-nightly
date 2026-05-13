/*
 * AlertController
 *
 * First extraction layer for the legacy displayAlert() system.
 *
 * Current goal:
 * - encapsulate alert DOM access
 * - encapsulate timers
 * - encapsulate singleton logic
 * - preserve current legacy UX behavior
 *
 * This is intentionally minimal for now.
 */

export class AlertController {
    constructor({
        elementId = "alertMsg",
        duration = 10000,
    } = {}) {
        this.elementId = elementId;
        this.duration = duration;

        this.visible = false;
        this.timer = null;
    }

    getElement() {
        return document.getElementById(this.elementId);
    }

    show(title, description) {
        const element = this.getElement();

        if (!element || this.visible) {
            return;
        }

        this.visible = true;

        element.innerHTML = `<h2>${title}</h2><p>${description}</p>`;
        element.style.display = "block";

        this.timer = window.setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    hide() {
        const element = this.getElement();

        if (!element) {
            return;
        }

        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }

        element.style.display = "none";
        this.visible = false;
    }
}

export const alertController = new AlertController();
