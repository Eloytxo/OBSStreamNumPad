import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import { useObsStore } from './obs';

export const useConnectionStore = defineStore('connection', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');

    const status = ref(CONNECTION_STATUS.IDLE);

    function disconnect() {
        status.value = CONNECTION_STATUS.IDLE;
        useObsStore().reset();
    }

    return {
        host,
        port,
        password,
        status,
        disconnect
    };

});