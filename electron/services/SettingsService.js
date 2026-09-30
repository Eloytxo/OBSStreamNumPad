import Store from 'electron-store';

export class SettingsService {

    constructor(options = {}) {
        this.store = new Store({
            name: options.name || 'settings',
            cwd: options.cwd,
            projectName: options.projectName || 'OBSStreamNumPad',
            defaults: {
                _schemaVersion: 2,
                host: 'localhost',
                port: 4455,
                password: '',
                locale: 'es',
                activeCollection: '',
                collections: {}
            }
        });
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        this.store.set(key, value);
    }

    getAll() {
        return this.store.store;
    }

    savePartial(data) {
        Object.entries(data).forEach(([key, value]) => {
            this.store.set(key, value);
        });
    }

    /**
     * Returns the persisted collection for the given name, or an empty default
     * collection without creating a persisted entry.
     *
     * @param {string} name
     * @returns {{ mappings: Array, cachedScenes: Array, cachedInputs: Array }}
     */
    getCollection(name) {
        const collections = this.get('collections') || {};
        return collections[name] || {
            mappings: [],
            cachedScenes: [],
            cachedInputs: []
        };
    }

    /**
     * Persists a complete collection object under the given name.
     *
     * @param {string} name
     * @param {{ mappings: Array, cachedScenes: Array, cachedInputs: Array }} data
     */
    setCollection(name, data) {
        const collections = { ...(this.get('collections') || {}) };
        collections[name] = data;
        this.set('collections', collections);
    }

    /**
     * Migrates legacy flat mappings into the active OBS scene collection.
     *
     * @param {string} activeCollectionName
     * @returns {{ success: boolean, migrated: boolean, error?: string }}
     */
    migrateLegacyMappings(activeCollectionName) {
        try {
            const legacy = this.get('mappings');

            if (!Array.isArray(legacy)) {
                return { success: true, migrated: false };
            }

            const collections = { ...(this.get('collections') || {}) };
            const existing = collections[activeCollectionName];

            if (!existing || !Array.isArray(existing.mappings) || existing.mappings.length === 0) {
                collections[activeCollectionName] = {
                    mappings: legacy,
                    cachedScenes: existing?.cachedScenes || [],
                    cachedInputs: existing?.cachedInputs || []
                };
            }

            this.set('__legacyMappingsBackup', legacy);
            this.set('collections', collections);
            this.set('activeCollection', activeCollectionName);
            this.set('_schemaVersion', 2);
            this.store.delete('mappings');

            return { success: true, migrated: true };
        } catch (error) {
            return { success: false, migrated: false, error: error.message };
        }
    }

}

export default new SettingsService();
