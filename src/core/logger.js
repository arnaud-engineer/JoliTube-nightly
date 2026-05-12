/*
 * Lightweight runtime logger for progressive debugging.
 *
 * Goal:
 * avoid random console.log calls spread across the app.
 */

const PREFIX = "[JoliTube]";

export const logger = {
    info(...args) {
        console.info(PREFIX, ...args);
    },

    warn(...args) {
        console.warn(PREFIX, ...args);
    },

    error(...args) {
        console.error(PREFIX, ...args);
    },

    debug(...args) {
        console.debug(PREFIX, ...args);
    }
};
