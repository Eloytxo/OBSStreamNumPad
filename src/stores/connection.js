import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConnectionStore = defineStore('connection', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');

    const connected = ref(false);
    const connecting = ref(false);

    return {
        host,
        port,
        password,
        connected,
        connecting
    };

});