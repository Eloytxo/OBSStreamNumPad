import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

function createMockWindow() {
    const handlers = {};

    return {
        handlers,
        api: {
            obs: {
                getScenes: vi.fn(async () => ({ success: true, scenes: [] })),
                getInputs: vi.fn(async () => ({ success: true, inputs: [] })),
                getSceneCollectionList: vi.fn(async () => ({
                    success: true,
                    sceneCollections: ['Default', 'Gaming'],
                    currentSceneCollectionName: 'Default'
                })),
                getCurrentSceneCollection: vi.fn(async () => ({
                    success: true,
                    sceneCollectionName: 'Default'
                })),
                onSceneCollectionChanged: vi.fn((cb) => {
                    handlers.sceneCollectionChanged = cb;
                    return () => {};
                }),
                onSceneCollectionListChanged: vi.fn((cb) => {
                    handlers.sceneCollectionListChanged = cb;
                    return () => {};
                }),
            },
            settings: {
                load: vi.fn(async () => ({
                    host: 'localhost',
                    port: 4455,
                    password: '',
                    locale: 'es',
                    activeCollection: '',
                    collections: {}
                })),
                save: vi.fn(async () => ({ success: true })),
                migrateLegacyMappings: vi.fn(async () => ({ success: true, migrated: false })),
            },
            keyboard: {
                start: vi.fn(async () => ({ success: true })),
                stop: vi.fn(async () => ({ success: true })),
                onActionExecuted: vi.fn(),
            },
            window: {
                close: vi.fn(),
                minimize: vi.fn(),
                maximize: vi.fn(),
                focus: vi.fn(),
            },
        },
    };
}

describe('obsStore', () => {

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    test('switches the UI-selected collection when OBS reports a new active collection', async () => {

        const mock = createMockWindow();
        vi.stubGlobal('window', { api: mock.api });

        const { useObsStore } = await import('./obs.js');
        const { useSettingsStore } = await import('./settings.js');

        const obsStore = useObsStore();
        const settingsStore = useSettingsStore();

        expect(obsStore.currentSceneCollection).toBe('');

        mock.handlers.sceneCollectionChanged({ sceneCollectionName: 'Gaming' });

        expect(obsStore.currentSceneCollection).toBe('Gaming');
        expect(settingsStore.currentCollection).toBe('Gaming');
        expect(settingsStore.activeCollection).toBe('Gaming');

    });

    test('syncs active and current collection after fetching scene collections', async () => {

        const mock = createMockWindow();
        vi.stubGlobal('window', { api: mock.api });

        const { useObsStore } = await import('./obs.js');
        const { useSettingsStore } = await import('./settings.js');

        const obsStore = useObsStore();
        const settingsStore = useSettingsStore();

        await obsStore.fetchSceneCollections();

        expect(obsStore.sceneCollections).toEqual(['Default', 'Gaming']);
        expect(obsStore.currentSceneCollection).toBe('Default');
        expect(settingsStore.currentCollection).toBe('Default');
        expect(settingsStore.activeCollection).toBe('Default');
        expect(mock.api.settings.save).toHaveBeenCalledWith(
            expect.objectContaining({ activeCollection: 'Default' })
        );

    });

    test('refreshes list and current collection when OBS reports the list changed', async () => {

        const mock = createMockWindow();
        vi.stubGlobal('window', { api: mock.api });

        const { useObsStore } = await import('./obs.js');

        const obsStore = useObsStore();

        mock.api.obs.getSceneCollectionList.mockResolvedValueOnce({
            success: true,
            sceneCollections: ['Default', 'Gaming', 'Podcast'],
            currentSceneCollectionName: 'Podcast'
        });
        mock.api.obs.getCurrentSceneCollection.mockResolvedValueOnce({
            success: true,
            sceneCollectionName: 'Podcast'
        });

        mock.handlers.sceneCollectionListChanged();

        // Wait for the async handlers triggered by the event
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(obsStore.sceneCollections).toEqual(['Default', 'Gaming', 'Podcast']);
        expect(obsStore.currentSceneCollection).toBe('Podcast');

    });

});
