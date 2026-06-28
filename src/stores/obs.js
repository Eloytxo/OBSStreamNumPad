import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useObsStore = defineStore('obs', () => {

    const scenes = ref([]);
    const inputs = ref([]);
    const isConnected = ref(false);

    async function fetchScenes() {
        const result = await window.api.obs.getScenes();
        if (result.success) {
            scenes.value = result.scenes;
        }
        return result;
    }

    async function fetchInputs() {
        const result = await window.api.obs.getInputs();
        if (result.success) {
            inputs.value = result.inputs;
        }
        return result;
    }

    function setConnected(connected) {
        isConnected.value = connected;
    }

    return {
        scenes,
        inputs,
        isConnected,
        fetchScenes,
        fetchInputs,
        setConnected
    };

});
