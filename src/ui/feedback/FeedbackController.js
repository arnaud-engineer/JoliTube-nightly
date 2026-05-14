/*
 * FeedbackController
 *
 * First extraction layer for the legacy showFeedback()/hideFeedback() system.
 *
 * Current goal:
 * - centralize HUD feedback ownership
 * - preserve existing DOM structure
 * - prepare migration away from script.js
 *
 * Existing feedback targets:
 * - channelNumFeedback
 * - volumeFeedback
 * - muteFeedback
 */

export class FeedbackController {
    constructor({
        containerId = "buttonsFeedback",
        duration = 2000,
    } = {}) {
        this.containerId = containerId;
        this.duration = duration;

        this.activeTimers = new Map();
    }

    getContainer() {
        return document.getElementById(this.containerId);
    }

    getElement(id) {
        return document.getElementById(id);
    }

    show(id, value) {
        const container = this.getContainer();
        const element = this.getElement(id);

        if (!container || !element) {
            return;
        }

        Array.from(container.children).forEach((child) => {
            if (child.id !== id) {
                child.classList.add("hidden");
                child.classList.remove("displayed");
            }
        });

        element.innerHTML = value;

        container.classList.remove("hidden");
        container.classList.add("displayed");

        element.classList.remove("hidden");
        element.classList.add("displayed");

        this.scheduleHide(id);
    }

    scheduleHide(id) {
        const existingTimer = this.activeTimers.get(id);

        if (existingTimer) {
            window.clearTimeout(existingTimer);
        }

        const timer = window.setTimeout(() => {
            this.hide(id);
        }, this.duration);

        this.activeTimers.set(id, timer);
    }

    hide(id) {
        const container = this.getContainer();
        const element = this.getElement(id);

        if (!container || !element) {
            return;
        }

        element.classList.remove("displayed");
        element.classList.add("hidden");

        const displayedElements = container.querySelectorAll(".displayed");

        if (displayedElements.length <= 1) {
            container.classList.remove("displayed");
            container.classList.add("hidden");
        }

        this.activeTimers.delete(id);
    }
}

export const feedbackController = new FeedbackController();
