import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useConnectionStore } from './connection';

const EMPTY_COLLECTION = {
    mappings: [],
    cachedScenes: [],
    cachedInputs: []
};

export const useSettingsStore = defineStore('settings', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');
    const locale = ref('es');
    const collections = ref({});
    const activeCollection = ref('');
    const currentCollection = ref('');

    const currentCollectionData = computed(() => {
        return collections.value[currentCollection.value] || { ...EMPTY_COLLECTION };
    });

    const mappings = computed(() => currentCollectionData.value.mappings);

    const cachedScenes = computed({
        get: () => currentCollectionData.value.cachedScenes,
        set: (value) => {
            ensureCurrentCollection();
            collections.value[currentCollection.value].cachedScenes = value;
        }
    });

    const cachedInputs = computed({
        get: () => currentCollectionData.value.cachedInputs,
        set: (value) => {
            ensureCurrentCollection();
            collections.value[currentCollection.value].cachedInputs = value;
        }
    });

    function ensureCurrentCollection() {
        if (currentCollection.value && !collections.value[currentCollection.value]) {
            collections.value[currentCollection.value] = { ...EMPTY_COLLECTION };
        }
    }

    async function loadFromElectron() {
        const data = await window.api.settings.load();

        host.value = data.host ?? 'localhost';
        port.value = data.port ?? 4455;
        password.value = data.password ?? '';
        locale.value = data.locale ?? 'es';
        collections.value = data.collections ?? {};
        activeCollection.value = data.activeCollection ?? '';
        currentCollection.value = data.activeCollection ?? '';

        // Sync with connectionStore so the connection form is prefilled
        const connectionStore = useConnectionStore();
        connectionStore.host = host.value;
        connectionStore.port = port.value;
        connectionStore.password = password.value;
    }

    async function saveToElectron() {
        const data = JSON.parse(JSON.stringify({
            host: host.value,
            port: port.value,
            password: password.value,
            locale: locale.value,
            activeCollection: activeCollection.value,
            collections: collections.value
        }));
        await window.api.settings.save(data);
    }

    async function savePartial(data) {
        const plainData = JSON.parse(JSON.stringify(data));
        await window.api.settings.save(plainData);

        if (data.host !== undefined) host.value = data.host;
        if (data.port !== undefined) port.value = data.port;
        if (data.password !== undefined) password.value = data.password;
        if (data.locale !== undefined) locale.value = data.locale;
        if (data.activeCollection !== undefined) activeCollection.value = data.activeCollection;
        if (data.collections !== undefined) collections.value = data.collections;
    }

    async function saveCollection(name) {
        if (!name) return;

        ensureCurrentCollection();

        const updatedCollections = JSON.parse(JSON.stringify({
            ...collections.value,
            [name]: collections.value[name] || { ...EMPTY_COLLECTION }
        }));

        await savePartial({ collections: updatedCollections });
    }

    async function migrateLegacyMappings(activeCollectionName) {
        const result = await window.api.settings.migrateLegacyMappings(activeCollectionName);

        if (result.success) {
            await loadFromElectron();
            currentCollection.value = activeCollectionName;
        }

        return result;
    }

    async function clearMappings() {
        ensureCurrentCollection();
        collections.value[currentCollection.value].mappings = [];
        await saveCollection(currentCollection.value);
    }

    function hasKey(key) {
        return mappings.value.some((mapping) => mapping.key === key);
    }

    function findByKey(key) {
        return mappings.value.find((mapping) => mapping.key === key);
    }

    async function addOrReplaceMapping(mapping) {
        ensureCurrentCollection();

        const list = mappings.value;
        const index = list.findIndex((m) => m.key === mapping.key);

        if (index >= 0) {
            list[index] = mapping;
        } else {
            list.push(mapping);
        }

        await saveCollection(currentCollection.value);
    }

    async function deleteMapping(mapping) {
        ensureCurrentCollection();

        const updatedMappings = mappings.value.filter((m) => m.key !== mapping.key);
        collections.value[currentCollection.value].mappings = updatedMappings;

        await saveCollection(currentCollection.value);
    }

    async function deleteCollection(name) {
        const { [name]: _removed, ...remaining } = collections.value;
        await savePartial({ collections: remaining });

        if (currentCollection.value === name) {
            currentCollection.value = activeCollection.value || '';
        }
    }

    return {
        host,
        port,
        password,
        locale,
        collections,
        activeCollection,
        currentCollection,
        mappings,
        cachedScenes,
        cachedInputs,
        loadFromElectron,
        saveToElectron,
        savePartial,
        saveCollection,
        migrateLegacyMappings,
        clearMappings,
        hasKey,
        findByKey,
        addOrReplaceMapping,
        deleteMapping,
        deleteCollection
    };

});
