import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import { useObsStore } from './obs';

export const useConnectionStore = defineStore('connection', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');

    const status = ref(CONNECTION_STATUS.IDLE);
    const error = ref(null);

    function disconnect() {
        status.value = CONNECTION_STATUS.IDLE;
        error.value = null;
        useObsStore().reset();
    }

    function connectionLost(reason) {
        status.value = CONNECTION_STATUS.DISCONNECTED;
        error.value = reason;
        useObsStore().reset();
    }

    return {
        host,
        port,
        password,
        status,
        error,
        disconnect,
        connectionLost
    };

});