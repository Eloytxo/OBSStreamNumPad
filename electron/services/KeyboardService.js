import { GlobalKeyboardListener } from 'node-global-key-listener';

class KeyboardService {

    constructor() {

        this.listener = null;
        this.running = false;
        this._listenerRef = null;

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

            this.listener = new GlobalKeyboardListener();

            this._listenerRef = (e, down) => {

                callback({
                    key: e.name,
                    state: e.state
                });

            };

            this.listener.addListener(this._listenerRef);

            this.running = true;

            console.log('[KeyboardService] Listener iniciado');

            return {
                success: true
            };

        } catch (error) {

            console.error('[KeyboardService] Error al iniciar:', error.message);

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

        if (!this.running) {

            return;

        }

        try {

            if (this.listener && this._listenerRef) {

                this.listener.removeListener(this._listenerRef);

            }

            this.running = false;
            this.listener = null;
            this._listenerRef = null;

            console.log('[KeyboardService] Listener detenido');

        } catch (error) {

            console.error('[KeyboardService] Error al detener:', error.message);

        }

    }

    /**
     * @returns {boolean} true si el listener está activo
     */
    isRunning() {

        return this.running;

    }

}

export default new KeyboardService();
