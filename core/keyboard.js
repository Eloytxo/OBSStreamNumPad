/**
 * Electron globalShortcut accelerator helpers.
 *
 * Maps Electron accelerator names (e.g. "num1") to the stored key names
 * used in the application settings (e.g. "Numpad1").
 */

/**
 * Map of Electron globalShortcut accelerators to stored key names.
 *
 * Key: Electron accelerator (e.g. "num1")
 * Value: stored key name (e.g. "Numpad1")
 */
const ACCELERATOR_MAP = {
    'num0': 'Numpad0',
    'num1': 'Numpad1',
    'num2': 'Numpad2',
    'num3': 'Numpad3',
    'num4': 'Numpad4',
    'num5': 'Numpad5',
    'num6': 'Numpad6',
    'num7': 'Numpad7',
    'num8': 'Numpad8',
    'num9': 'Numpad9'
};

/**
 * Normalizes an Electron accelerator to the stored key name.
 * Also accepts already normalized values (e.g. "Numpad1").
 *
 * @param {string} accelerator - Electron globalShortcut accelerator (e.g. "num1") or stored key name
 * @returns {string|null} Normalized key name (e.g. "Numpad1") or null if unknown
 */
export function normalizeAccelerator(accelerator) {

    if (!accelerator) {

        return null;

    }

    if (ACCELERATOR_MAP[accelerator.toLowerCase()]) {

        return ACCELERATOR_MAP[accelerator.toLowerCase()];

    }

    if (/^Numpad\d$/.test(accelerator)) {

        return accelerator;

    }

    return null;

}
