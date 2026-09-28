import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useConnectionStore } from './connection';

export const useSettingsStore = defineStore('settings', () => {

    const host = ref('localhost');
    const port = ref(4455);
    const password = ref('');
    const locale = ref('es');
    const mappings = ref([]);

    async function loadFromElectron() {
        const data = await window.api.settings.load();
        host.value = data.host;
        port.value = data.port;
        password.value = data.password;
        locale.value = data.locale;
        mappings.value = data.mappings;

        // Sync with connectionStore so the connection form is prefilled
        const connectionStore = useConnectionStore();
        connectionStore.host = data.host;
        connectionStore.port = data.port;
        connectionStore.password = data.password;
    }

    async function saveToElectron() {
        const data = JSON.parse(JSON.stringify({
            host: host.value,
            port: port.value,
            password: password.value,
            locale: locale.value,
            mappings: mappings.value
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
        if (data.mappings !== undefined) mappings.value = data.mappings;
    }

    async function clearMappings() {
        await savePartial({ mappings: [] });
    }

    function hasKey(key) {
        return mappings.value.some((mapping) => mapping.key === key);
    }

    function findByKey(key) {
        return mappings.value.find((mapping) => mapping.key === key);
    }

    async function addOrReplaceMapping(mapping) {
        const index = mappings.value.findIndex((m) => m.key === mapping.key);

        if (index >= 0) {
            mappings.value[index] = mapping;
        } else {
            mappings.value.push(mapping);
        }

        await savePartial({ mappings: mappings.value });
    }

    return {
        host,
        port,
        password,
        locale,
        mappings,
        loadFromElectron,
        saveToElectron,
        savePartial,
        clearMappings,
        hasKey,
        findByKey,
        addOrReplaceMapping
    };

});
