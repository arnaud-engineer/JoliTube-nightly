/*
 * Minimal event bus for JoliTube.
 *
 * Purpose:
 * - reduce hidden coupling between player, UI and input layers
 * - keep vanilla JS architecture lightweight
 * - avoid introducing a framework just for event coordination
 *
 * This is intentionally tiny.
 */

export function createEventBus() {
    const listeners = new Map();

    function on(eventName, callback) {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }

        listeners.get(eventName).add(callback);

        return function unsubscribe() {
            off(eventName, callback);
        };
    }

    function off(eventName, callback) {
        if (!listeners.has(eventName)) {
            return;
        }

        listeners.get(eventName).delete(callback);

        if (listeners.get(eventName).size === 0) {
            listeners.delete(eventName);
        }
    }

    function emit(eventName, payload = {}) {
        if (!listeners.has(eventName)) {
            return;
        }

        listeners.get(eventName).forEach((callback) => {
            try {
                callback(payload);
            } catch (error) {
                console.error("[JoliTube:eventBus] listener failed", eventName, error);
            }
        });
    }

    return {
        on,
        off,
        emit,
    };
}

export const eventBus = createEventBus();
