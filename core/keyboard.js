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
