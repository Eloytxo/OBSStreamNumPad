import { describe, test, expect, vi } from 'vitest';
import { SettingsService } from './SettingsService.js';

vi.mock('electron-store', () => {
    return {
        default: class Store {
            constructor(options = {}) {
                this._data = { ...(options.defaults || {}) };
            }
            get(key) {
                return this._data[key];
            }
            set(key, value) {
                this._data[key] = value;
            }
            delete(key) {
                delete this._data[key];
            }
            get store() {
                return this._data;
            }
        }
    };
});

function createService() {
    return new SettingsService({ projectName: 'test' });
}

describe('SettingsService', () => {

    test('fresh store has schema version 2 and empty collections', () => {
        const service = createService();
        const all = service.getAll();

        expect(all._schemaVersion).toBe(2);
        expect(all.collections).toEqual({});
        expect(all.mappings).toBeUndefined();
    });

    test('getCollection returns an empty default for unknown names', () => {
        const service = createService();
        const collection = service.getCollection('Missing');

        expect(collection).toEqual({ mappings: [], cachedScenes: [], cachedInputs: [] });
        expect(service.get('collections')).toEqual({});
    });

    test('setCollection persists and getCollection returns the same data', () => {
        const service = createService();
        const data = {
            mappings: [{ key: 'Numpad1', actionType: 'scene', target: 'Intro' }],
            cachedScenes: [{ sceneName: 'Intro' }],
            cachedInputs: [{ inputName: 'Music', inputKind: 'ffmpeg_source' }]
        };

        service.setCollection('Stream', data);

        expect(service.getCollection('Stream')).toEqual(data);
        expect(service.get('collections').Stream).toEqual(data);
    });

    test('migrateLegacyMappings copies flat mappings into the active collection', () => {
        const service = createService();
        const legacy = [
            { key: 'Numpad1', actionType: 'scene', target: 'GamingScene' },
            { key: 'Numpad2', actionType: 'media', target: 'Music' }
        ];

        service.set('mappings', legacy);

        const result = service.migrateLegacyMappings('Gaming');

        expect(result).toEqual({ success: true, migrated: true });
        expect(service.getCollection('Gaming').mappings).toEqual(legacy);
        expect(service.get('activeCollection')).toBe('Gaming');
        expect(service.get('mappings')).toBeUndefined();
        expect(service.get('_schemaVersion')).toBe(2);
    });

    test('migrateLegacyMappings is idempotent', () => {
        const service = createService();
        const legacy = [{ key: 'Numpad1', actionType: 'scene', target: 'GamingScene' }];

        service.set('mappings', legacy);
        service.migrateLegacyMappings('Gaming');
        const second = service.migrateLegacyMappings('Gaming');

        expect(second).toEqual({ success: true, migrated: false });
        expect(service.getCollection('Gaming').mappings).toEqual(legacy);
    });

    test('migrateLegacyMappings keeps a backup of the legacy mappings', () => {
        const service = createService();
        const legacy = [{ key: 'Numpad1', actionType: 'scene', target: 'Scene' }];

        service.set('mappings', legacy);
        service.migrateLegacyMappings('Gaming');

        expect(service.get('__legacyMappingsBackup')).toEqual(legacy);
    });

});
