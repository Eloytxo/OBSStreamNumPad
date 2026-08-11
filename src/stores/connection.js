import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import { useObsStore } from './obs';

export const useConnectionStore = defineStore('connection', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');

    
    const connecting = ref(false);

    const status = ref(CONNECTION_STATUS.IDLE);
    const error = ref('');

    function disconnect() {
        status.value = CONNECTION_STATUS.IDLE;
        error.value = '';
        useObsStore().reset();
    }

    return {
        host,
        port,
        password,

        connecting,
        status,
        error,
        disconnect
    };

});