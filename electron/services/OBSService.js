import EventEmitter from 'node:events';
import OBSWebSocket from 'obs-websocket-js';

class OBSService extends EventEmitter {

    constructor() {
        super();

        this.obs = new OBSWebSocket();

        this.connected = false;
        this._manuallyClosing = false;

        this.obs.on('ConnectionClosed', (error) => this._handleUnexpectedClose('closed', error));
        this.obs.on('ConnectionError', (error) => this._handleUnexpectedClose('error', error));
        this.obs.on('ExitStarted', () => this._handleUnexpectedClose('exit'));
        this.obs.on('CurrentSceneCollectionChanged', (data) => {
            this.emit('sceneCollectionChanged', { sceneCollectionName: data.sceneCollectionName });
        });
    }

    /**
     * Connects to OBS Studio.
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

        if (!this.connected) {
            return;
        }

        this._manuallyClosing = true;

        try {
            await this.obs.disconnect();
        } catch (error) {
            console.error('[OBSService] Error during disconnect:', error);
        } finally {
            this._manuallyClosing = false;
            this.connected = false;
        }

    }

    /**
     * Handles unexpected websocket closures triggered by obs-websocket-js events.
     *
     * @param {string} reason - 'closed' | 'error' | 'exit'
     * @param {Error} [error]
     * @private
     */
    _handleUnexpectedClose(reason, error) {

        if (!this.connected || this._manuallyClosing) {
            return;
        }

        console.error(`[OBSService] Unexpected connection loss: ${reason}`, error);

        this.connected = false;

        this.emit('connectionLost', { reason, error });

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

    async getSceneCollectionList() {

        if (!this.connected) {
            return {
                success: false,
                message: 'OBS not connected'
            };
        }

        try {

            const result = await this.obs.call('GetSceneCollectionList');

            return {
                success: true,
                currentSceneCollectionName: result.currentSceneCollectionName,
                sceneCollections: result.sceneCollections
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };

        }

    }

    async getCurrentSceneCollection() {

        if (!this.connected) {
            return {
                success: false,
                message: 'OBS not connected'
            };
        }

        try {

            const result = await this.obs.call('GetCurrentSceneCollection');

            return {
                success: true,
                sceneCollectionName: result.sceneCollectionName
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };

        }

    }

    /**
     * Switches the current scene in OBS.
     *
     * @param {string} sceneName - Target scene name
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
     * Triggers an action on a media input in OBS.
     *
     * @param {string} inputName - Media input name
     * @param {string} action - Action to run (e.g. "PLAY", "PAUSE", "STOP", "RESTART")
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
     * Gets the sceneItemId of a source inside a scene.
     *
     * @param {string} sourceName - Source (input) name in OBS
     * @param {string} sceneName - Scene name
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
     * Gets the enabled/disabled state of a scene item.
     *
     * @param {number} sceneItemId - Scene item ID
     * @param {string} sceneName - Scene name
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
     * Sets the enabled/disabled state of a scene item.
     *
     * @param {number} sceneItemId - Scene item ID
     * @param {string} sceneName - Scene name
     * @param {boolean} enabled - true to show, false to hide
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