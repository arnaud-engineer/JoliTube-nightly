import { alertController } from "./alerts/AlertController.js";
import { feedbackController } from "./feedback/FeedbackController.js";

/*
 * UI bootstrap.
 *
 * Registers modular UI controllers in the runtime namespace.
 */

window.JoliTubeRuntime = {
    ...(window.JoliTubeRuntime || {}),
    alertController,
    feedbackController,
};
