/**
 * Mapa bidireccional de teclas del numpad.
 *
 * Clave: nombre runtime (node-global-key-listener) ej. "NUMPAD 0"
 * Valor: nombre almacenado en settings ej. "Numpad0"
 */
const KEY_MAP = {
    'NUMPAD 0': 'Numpad0',
    'NUMPAD 1': 'Numpad1',
    'NUMPAD 2': 'Numpad2',
    'NUMPAD 3': 'Numpad3',
    'NUMPAD 4': 'Numpad4',
    'NUMPAD 5': 'Numpad5',
    'NUMPAD 6': 'Numpad6',
    'NUMPAD 7': 'Numpad7',
    'NUMPAD 8': 'Numpad8',
    'NUMPAD 9': 'Numpad9'
};

// Mapa inverso: "Numpad0" → "NUMPAD 0"
const REVERSE_MAP = Object.fromEntries(
    Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

/**
 * Mapa de aceleradores de Electron a teclas almacenadas.
 *
 * Clave: acelerador de globalShortcut (ej. "num1")
 * Valor: nombre almacenado en settings ej. "Numpad1"
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
 * Normaliza una tecla runtime al formato almacenado.
 *
 * @param {string} runtimeKey - Nombre de tecla desde el listener (ej. "NUMPAD 1")
 * @returns {string|null} Nombre normalizado (ej. "Numpad1") o null si es desconocida
 */
export function normalize(runtimeKey) {

    return KEY_MAP[runtimeKey] || null;

}

/**
 * Convierte una tecla almacenada al formato runtime.
 *
 * @param {string} storedKey - Nombre almacenado (ej. "Numpad0")
 * @returns {string|null} Nombre runtime (ej. "NUMPAD 0") o null si es desconocida
 */
export function toRuntime(storedKey) {

    return REVERSE_MAP[storedKey] || null;

}

/**
 * Normaliza un acelerador de Electron al formato almacenado.
 * También acepta valores ya normalizados (p. ej. "Numpad1").
 *
 * @param {string} accelerator - Acelerador de globalShortcut (ej. "num1") o tecla almacenada
 * @returns {string|null} Nombre normalizado (ej. "Numpad1") o null si es desconocida
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
