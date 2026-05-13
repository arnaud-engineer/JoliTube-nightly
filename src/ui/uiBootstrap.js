import { alertController } from "./alerts/AlertController.js";
import { feedbackController } from "./feedback/FeedbackController.js";

/*
 * UI bootstrap.
 *
 * Transitional bridge between legacy global helpers and the new modular UI
 * controllers.
 *
 * Goal:
 * keep the current UX fully compatible while progressively moving ownership
 * away from script.js.
 */

window.__JOLITUBE_ALERT_CONTROLLER__ = alertController;
window.__JOLITUBE_FEEDBACK_CONTROLLER__ = feedbackController;

window.displayAlert = function(title, description) {
    alertController.show(title, description);
};

window.hideAlert = function() {
    alertController.hide();
};

window.showFeedback = function(id, value) {
    feedbackController.show(id, value);
};

window.hideFeedback = function(id) {
    feedbackController.hide(id);
};
