import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CONNECTION_STATUS } from '../constants/connectionStatus';

export const useConnectionStore = defineStore('connection', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');

    
    const connecting = ref(false);

    const status = ref(CONNECTION_STATUS.IDLE);
    const error = ref('');

    return {
        host,
        port,
        password,

        connecting,
        status,
        error
    };

});