import Store from 'electron-store';

class SettingsService {

    constructor() {
        this.store = new Store({
            name: 'settings',
            defaults: {
                host: 'localhost',
                port: 4455,
                password: '',
                locale: 'es',
                mappings: []
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

}

export default new SettingsService();
