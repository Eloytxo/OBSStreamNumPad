const OBSWebSocket = require('obs-websocket-js').default;

class OBSService {

    constructor() {
        this.obs = new OBSWebSocket();
        this.connected = false;
    }

    async connect(host, port, password) {

    }

    async disconnect() {

    }

    isConnected() {

    }

    async getScenes() {

    }

    async getInputs() {

    }

    async playSound() {

    }

}