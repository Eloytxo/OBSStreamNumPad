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
                scenes: result.scenes
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

}

export default new OBSService();