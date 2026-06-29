import OBSWebSocket from 'obs-websocket-js';

class OBSService {

    constructor() {
        this.obs = new OBSWebSocket();

        this.connected = false;
    }

    /**
     * Conecta con OBS Studio.
     *
     * @param {string} host
     * @param {number} port
     * @param {string} password
     * @returns {Promise<{success:boolean,message:string}>}
     */
    async connect(host, port, password) {

        try {

            await this.obs.connect(
                `ws://${host}:${port}`,
                password
            );

            this.connected = true;

            return {
                success: true,
                message: 'Connected'
            };

        } catch (error) {

            this.connected = false;

            return {
                success: false,
                message: error.message
            };

        }

    }

    async disconnect() {

        if (this.connected) {

            this.obs.disconnect();

            this.connected = false;

        }

    }

    isConnected() {

        return this.connected;

    }

    async getSceneList() {

        try {

            const result = await this.obs.call('GetSceneList');

            return {
                success: true,
                scenes: result.scenes,
                currentProgramSceneName: result.currentProgramSceneName
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };

        }

    }

    async getInputList() {

        try {

            const result = await this.obs.call('GetInputList');

            return {
                success: true,
                inputs: result.inputs
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Cambia la escena actual en OBS.
     *
     * @param {string} sceneName - Nombre de la escena destino
     * @returns {Promise<{success:boolean,message?:string}>}
     */
    async setCurrentScene(sceneName) {

        if (!this.connected) {

            return {
                success: false,
                message: 'OBS not connected'
            };

        }

        try {

            console.log(`[OBSService] Llamando SetCurrentProgramScene con sceneName: "${sceneName}"`);
            await this.obs.call('SetCurrentProgramScene', {
                sceneName
            });

            return {
                success: true
            };

        } catch (error) {

            console.error(`[OBSService] Error en SetCurrentProgramScene:`, error);
            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Dispara una acción sobre un input de tipo media en OBS.
     *
     * @param {string} inputName - Nombre del input media
     * @param {string} action - Acción a ejecutar (ej. "PLAY", "PAUSE", "STOP", "RESTART")
     * @returns {Promise<{success:boolean,message?:string}>}
     */
    async triggerMediaAction(inputName, action) {

        if (!this.connected) {

            return {
                success: false,
                message: 'OBS not connected'
            };

        }

        try {

            // Map simplified action names to OBS WebSocket v5 enum values
            const MEDIA_ACTIONS = {
                PLAY: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY',
                PAUSE: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE',
                STOP: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
                RESTART: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART'
            };

            const obsAction = MEDIA_ACTIONS[action] || action;

            console.log(`[OBSService] Llamando TriggerMediaInputAction con inputName: "${inputName}", mediaAction: "${obsAction}"`);
            await this.obs.call('TriggerMediaInputAction', {
                inputName,
                mediaAction: obsAction
            });

            return {
                success: true
            };

        } catch (error) {

            console.error(`[OBSService] Error en TriggerMediaInputAction:`, error);
            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Obtiene el sceneItemId de un source dentro de una escena.
     *
     * @param {string} sourceName - Nombre del source (input) en OBS
     * @param {string} sceneName - Nombre de la escena
     * @returns {Promise<{success:boolean,data?:number,message?:string}>}
     */
    async getSceneItemId(sourceName, sceneName) {

        if (!this.connected) {

            return {
                success: false,
                message: 'OBS not connected'
            };

        }

        try {

            console.log(`[OBSService] Llamando GetSceneItemId con sourceName: "${sourceName}", sceneName: "${sceneName}"`);
            const result = await this.obs.call('GetSceneItemId', {
                sceneName,
                sourceName
            });

            return {
                success: true,
                data: result.sceneItemId
            };

        } catch (error) {

            console.error(`[OBSService] Error en GetSceneItemId:`, error);
            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Obtiene el estado enabled/disabled de un scene item.
     *
     * @param {number} sceneItemId - ID del item en la escena
     * @param {string} sceneName - Nombre de la escena
     * @returns {Promise<{success:boolean,data?:boolean,message?:string}>}
     */
    async getSceneItemEnabled(sceneItemId, sceneName) {

        if (!this.connected) {

            return {
                success: false,
                message: 'OBS not connected'
            };

        }

        try {

            console.log(`[OBSService] Llamando GetSceneItemEnabled con sceneItemId: ${sceneItemId}, sceneName: "${sceneName}"`);
            const result = await this.obs.call('GetSceneItemEnabled', {
                sceneName,
                sceneItemId
            });

            return {
                success: true,
                data: result.sceneItemEnabled
            };

        } catch (error) {

            console.error(`[OBSService] Error en GetSceneItemEnabled:`, error);
            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Establece el estado enabled/disabled de un scene item.
     *
     * @param {number} sceneItemId - ID del item en la escena
     * @param {string} sceneName - Nombre de la escena
     * @param {boolean} enabled - true para mostrar, false para ocultar
     * @returns {Promise<{success:boolean,message?:string}>}
     */
    async setSceneItemEnabled(sceneItemId, sceneName, enabled) {

        if (!this.connected) {

            return {
                success: false,
                message: 'OBS not connected'
            };

        }

        try {

            console.log(`[OBSService] Llamando SetSceneItemEnabled con sceneItemId: ${sceneItemId}, sceneName: "${sceneName}", enabled: ${enabled}`);
            await this.obs.call('SetSceneItemEnabled', {
                sceneName,
                sceneItemId,
                sceneItemEnabled: enabled
            });

            return {
                success: true
            };

        } catch (error) {

            console.error(`[OBSService] Error en SetSceneItemEnabled:`, error);
            return {
                success: false,
                message: error.message
            };

        }

    }

}

export default new OBSService();