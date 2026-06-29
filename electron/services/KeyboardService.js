import { globalShortcut } from 'electron';
import { normalizeAccelerator } from '../../core/keyboard.js';

const NUMPAD_ACCELERATORS = [
    'num0', 'num1', 'num2', 'num3', 'num4',
    'num5', 'num6', 'num7', 'num8', 'num9'
];

class KeyboardService {

    constructor() {

        this.running = false;
        this.registered = [];

    }

    /**
     * Inicia la captura global de teclas.
     *
     * @param {function} callback - Recibe { key: string, state: string }
     * @returns {{success:boolean,message?:string}}
     */
    start(callback) {

        if (this.running) {

            return {
                success: false,
                message: 'Keyboard listener already running'
            };

        }

        try {

            for (const accelerator of NUMPAD_ACCELERATORS) {

                const registered = globalShortcut.register(accelerator, () => {

                    const normalizedKey = normalizeAccelerator(accelerator);

                    callback({
                        key: normalizedKey,
                        state: 'DOWN'
                    });

                });

                if (!registered) {

                    this.stop();

                    return {
                        success: false,
                        message: `Failed to register hotkey ${accelerator}`
                    };

                }

                this.registered.push(accelerator);

            }

            this.running = true;

            console.log('[KeyboardService] Atajos globales registrados');

            return {
                success: true
            };

        } catch (error) {

            console.error('[KeyboardService] Error al iniciar:', error.message);

            this.stop();

            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Detiene la captura y libera recursos del SO.
     */
    stop() {

        if (this.registered.length > 0) {

            for (const accelerator of this.registered) {

                globalShortcut.unregister(accelerator);

            }

            this.registered = [];

        }

        this.running = false;

        console.log('[KeyboardService] Atajos globales liberados');

    }

    /**
     * @returns {boolean} true si los atajos están registrados
     */
    isRunning() {

        return this.running;

    }

}

export default new KeyboardService();
