import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSettingsStore } from './settings';

export const useObsStore = defineStore('obs', () => {

    const settingsStore = useSettingsStore();

    const scenes = ref([]);
    const inputs = ref([]);
    const isConnected = ref(false);
    const sceneCollections = ref([]);
    const currentSceneCollection = ref('');

    async function fetchScenes() {
        const isLive = isConnected.value &&
            settingsStore.currentCollection &&
            settingsStore.currentCollection === currentSceneCollection.value;

        if (isLive) {
            const result = await window.api.obs.getScenes();

            if (result.success) {
                scenes.value = result.scenes;
                settingsStore.cachedScenes = result.scenes;
                await settingsStore.saveCollection(settingsStore.currentCollection);
            }

            return result;
        }

        scenes.value = settingsStore.cachedScenes;
        return { success: true, scenes: scenes.value };
    }

    async function fetchInputs() {
        const isLive = isConnected.value &&
            settingsStore.currentCollection &&
            settingsStore.currentCollection === currentSceneCollection.value;

        if (isLive) {
            const result = await window.api.obs.getInputs();

            if (result.success) {
                inputs.value = result.inputs;
                settingsStore.cachedInputs = result.inputs;
                await settingsStore.saveCollection(settingsStore.currentCollection);
            }

            return result;
        }

        inputs.value = settingsStore.cachedInputs;
        return { success: true, inputs: inputs.value };
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
