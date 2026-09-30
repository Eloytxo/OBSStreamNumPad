import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useObsStore = defineStore('obs', () => {

    const scenes = ref([]);
    const inputs = ref([]);
    const isConnected = ref(false);
    const sceneCollections = ref([]);
    const currentSceneCollection = ref('');

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

    async function fetchSceneCollections() {
        const result = await window.api.obs.getSceneCollectionList();

        if (result.success) {
            sceneCollections.value = result.sceneCollections || [];
            currentSceneCollection.value = result.currentSceneCollectionName || '';
        } else {
            sceneCollections.value = [];
            currentSceneCollection.value = '';
        }

        return result;
    }

    async function fetchCurrentSceneCollection() {
        const result = await window.api.obs.getCurrentSceneCollection();

        if (result.success) {
            currentSceneCollection.value = result.sceneCollectionName || '';
        }

        return result;
    }

    function setCurrentSceneCollection(name) {
        currentSceneCollection.value = name;
    }

    function setConnected(connected) {
        isConnected.value = connected;
    }

    function reset() {
        scenes.value = [];
        inputs.value = [];
        isConnected.value = false;
        sceneCollections.value = [];
        currentSceneCollection.value = '';
    }

    // Keep the store in sync with OBS scene collection changes
    if (typeof window !== 'undefined' && window.api?.obs?.onSceneCollectionChanged) {
        window.api.obs.onSceneCollectionChanged(({ sceneCollectionName }) => {
            currentSceneCollection.value = sceneCollectionName;
        });
    }

    return {
        scenes,
        inputs,
        isConnected,
        sceneCollections,
        currentSceneCollection,
        fetchScenes,
        fetchInputs,
        fetchSceneCollections,
        fetchCurrentSceneCollection,
        setCurrentSceneCollection,
        setConnected,
        reset
    };

});
