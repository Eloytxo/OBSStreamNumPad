import { describe, test, expect, vi, beforeEach } from 'vitest';
import ActionDispatcher from './ActionDispatcher.js';

function createDispatcher(first = [], overrides = {}) {

    let activeCollection = 'Default';
    let mappings = [];

    if (Array.isArray(first)) {
        mappings = first;
    } else if (first && typeof first === 'object') {
        activeCollection = first.activeCollection || 'Default';
        mappings = first.mappings || [];
    }

    const obsService = {
        setCurrentScene: vi.fn(async () => ({ success: true })),
        triggerMediaAction: vi.fn(async () => ({ success: true })),
        getSceneList: vi.fn(async () => ({ success: true, currentProgramSceneName: 'SceneA' })),
        getSceneItemId: vi.fn(async () => ({ success: true, data: 42 })),
        getSceneItemEnabled: vi.fn(async () => ({ success: true, data: true })),
        setSceneItemEnabled: vi.fn(async () => ({ success: true })),
        ...(overrides.obsService || {}),
    };

    const settingsService = {
        get: vi.fn((key) => key === 'activeCollection' ? activeCollection : undefined),
        getCollection: vi.fn((name) => name === activeCollection
            ? { mappings, cachedScenes: [], cachedInputs: [] }
            : { mappings: [], cachedScenes: [], cachedInputs: [] }
        ),
        ...(overrides.settingsService || {}),
    };

    const mainWindow = overrides.mainWindow === undefined
        ? {
            isDestroyed: vi.fn(() => false),
            webContents: { send: vi.fn() },
        }
        : overrides.mainWindow;

    const dispatcher = new ActionDispatcher(obsService, settingsService, mainWindow);

    return { dispatcher, obsService, settingsService, mainWindow };

}

describe('ActionDispatcher', () => {

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('returns success when no mapping exists and does not call OBS or send IPC', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher([]);

        const result = await dispatcher.dispatch('Numpad1');

        expect(result).toEqual({ key: 'Numpad1', success: true });
        expect(obsService.setCurrentScene).not.toHaveBeenCalled();
        expect(obsService.triggerMediaAction).not.toHaveBeenCalled();
        expect(obsService.getSceneList).not.toHaveBeenCalled();
        expect(mainWindow.webContents.send).not.toHaveBeenCalled();

    });

    test('uses the first mapping and warns when multiple mappings match the same key', async () => {

        const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
        const mappings = [
            { key: 'Numpad1', actionType: 'scene', target: 'SceneA' },
            { key: 'Numpad1', actionType: 'media', target: 'MediaA' },
        ];
        const { dispatcher, obsService, mainWindow } = createDispatcher(mappings);

        const result = await dispatcher.dispatch('Numpad1');

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Múltiples mappings detectados para la tecla Numpad1:'),
            expect.any(String)
        );
        expect(obsService.setCurrentScene).toHaveBeenCalledExactlyOnceWith('SceneA');
        expect(obsService.triggerMediaAction).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            key: 'Numpad1',
            success: true,
            actionType: 'scene',
            target: 'SceneA',
            actionLabel: 'Escena',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('executes scene action successfully', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher([
            { key: 'Numpad1', actionType: 'scene', target: 'SceneB' },
        ]);

        const result = await dispatcher.dispatch('Numpad1');

        expect(obsService.setCurrentScene).toHaveBeenCalledExactlyOnceWith('SceneB');
        expect(result).toMatchObject({
            key: 'Numpad1',
            success: true,
            actionType: 'scene',
            target: 'SceneB',
            actionLabel: 'Escena',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('returns error when scene action fails', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            [{ key: 'Numpad1', actionType: 'scene', target: 'SceneB' }],
            {
                obsService: {
                    setCurrentScene: vi.fn(async () => ({ success: false, message: 'Scene error' })),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(result).toMatchObject({
            key: 'Numpad1',
            success: false,
            actionType: 'scene',
            target: 'SceneB',
            error: 'Scene error',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('executes media action calling triggerMediaAction with RESTART', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher([
            { key: 'Numpad2', actionType: 'media', target: 'MediaSource' },
        ]);

        const result = await dispatcher.dispatch('Numpad2');

        expect(obsService.triggerMediaAction).toHaveBeenCalledExactlyOnceWith('MediaSource', 'RESTART');
        expect(result).toMatchObject({
            key: 'Numpad2',
            success: true,
            actionType: 'media',
            target: 'MediaSource',
            actionLabel: 'Media',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('toggles visibility happy path', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher([
            { key: 'Numpad3', actionType: 'toggle_visibility', target: 'SourceA' },
        ]);

        const result = await dispatcher.dispatch('Numpad3');

        expect(obsService.getSceneList).toHaveBeenCalled();
        expect(obsService.getSceneItemId).toHaveBeenCalledExactlyOnceWith('SourceA', 'SceneA');
        expect(obsService.getSceneItemEnabled).toHaveBeenCalledExactlyOnceWith(42, 'SceneA');
        expect(obsService.setSceneItemEnabled).toHaveBeenCalledExactlyOnceWith(42, 'SceneA', false);
        expect(result).toMatchObject({
            key: 'Numpad3',
            success: true,
            actionType: 'toggle_visibility',
            target: 'SourceA',
            actionLabel: 'Visibilidad',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test.each([null, undefined])(
        'toggle visibility no-ops when source is not found (data %s)',
        async (data) => {

            const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
            const { dispatcher, obsService, mainWindow } = createDispatcher(
                [{ key: 'Numpad3', actionType: 'toggle_visibility', target: 'MissingSource' }],
                {
                    obsService: {
                        getSceneItemId: vi.fn(async () => ({ success: true, data })),
                    },
                }
            );

            const result = await dispatcher.dispatch('Numpad3');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Source "MissingSource" no encontrado en la escena "SceneA"')
            );
            expect(obsService.getSceneItemEnabled).not.toHaveBeenCalled();
            expect(obsService.setSceneItemEnabled).not.toHaveBeenCalled();
            expect(result).toMatchObject({
                key: 'Numpad3',
                success: true,
                actionType: 'toggle_visibility',
                target: 'MissingSource',
                actionLabel: 'Visibilidad',
            });
            expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

        }
    );

    test('toggle visibility returns error when there is no active scene', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            [{ key: 'Numpad3', actionType: 'toggle_visibility', target: 'SourceA' }],
            {
                obsService: {
                    getSceneList: vi.fn(async () => ({ success: true, currentProgramSceneName: undefined })),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad3');

        expect(obsService.getSceneItemId).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            key: 'Numpad3',
            success: false,
            actionType: 'toggle_visibility',
            target: 'SourceA',
            error: 'No se encontró la escena activa',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('toggle visibility handles getSceneList failure', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            [{ key: 'Numpad3', actionType: 'toggle_visibility', target: 'SourceA' }],
            {
                obsService: {
                    getSceneList: vi.fn(async () => ({ success: false, message: 'List error' })),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad3');

        expect(obsService.getSceneItemId).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            key: 'Numpad3',
            success: false,
            actionType: 'toggle_visibility',
            target: 'SourceA',
            error: 'No se pudo obtener la escena actual: List error',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('toggle visibility handles getSceneItemEnabled failure', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            [{ key: 'Numpad3', actionType: 'toggle_visibility', target: 'SourceA' }],
            {
                obsService: {
                    getSceneItemEnabled: vi.fn(async () => ({ success: false, message: 'Enabled error' })),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad3');

        expect(obsService.setSceneItemEnabled).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            key: 'Numpad3',
            success: false,
            actionType: 'toggle_visibility',
            target: 'SourceA',
            error: 'No se pudo leer el estado del item: Enabled error',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('returns unknown action type error for unrecognized action types', async () => {

        const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
        const { dispatcher, mainWindow } = createDispatcher([
            { key: 'Numpad9', actionType: 'unknown', target: 'X' },
        ]);

        const result = await dispatcher.dispatch('Numpad9');

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Tipo de acción desconocido: unknown')
        );
        expect(result).toMatchObject({
            key: 'Numpad9',
            success: false,
            actionType: 'unknown',
            target: 'X',
            error: 'Unknown action type: unknown',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('catches OBS exceptions and returns success false with the error message', async () => {

        const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
        const { dispatcher, mainWindow } = createDispatcher(
            [{ key: 'Numpad1', actionType: 'scene', target: 'SceneB' }],
            {
                obsService: {
                    setCurrentScene: vi.fn(async () => { throw new Error('OBS boom'); }),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error ejecutando acción:'),
            expect.any(Error)
        );
        expect(result).toMatchObject({
            key: 'Numpad1',
            success: false,
            actionType: 'scene',
            target: 'SceneB',
            error: 'OBS boom',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('does not send IPC when mainWindow is destroyed', async () => {

        const mainWindow = {
            isDestroyed: vi.fn(() => true),
            webContents: { send: vi.fn() },
        };
        const { dispatcher } = createDispatcher(
            [{ key: 'Numpad1', actionType: 'scene', target: 'SceneB' }],
            { mainWindow }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(result.success).toBe(true);
        expect(mainWindow.webContents.send).not.toHaveBeenCalled();

    });

    test('does not send IPC when mainWindow is null', async () => {

        const { dispatcher } = createDispatcher(
            [{ key: 'Numpad1', actionType: 'scene', target: 'SceneB' }],
            { mainWindow: null }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(result.success).toBe(true);

    });

    test('resolves mappings from the OBS-active collection, ignoring any UI-selected collection', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            {
                activeCollection: 'Gaming',
                mappings: [
                    { key: 'Numpad1', actionType: 'scene', target: 'GamingScene' },
                ],
            },
            {
                settingsService: {
                    getCollection: vi.fn((name) => {
                        if (name === 'Gaming') {
                            return { mappings: [{ key: 'Numpad1', actionType: 'scene', target: 'GamingScene' }], cachedScenes: [], cachedInputs: [] };
                        }
                        if (name === 'Podcast') {
                            return { mappings: [{ key: 'Numpad1', actionType: 'scene', target: 'PodcastScene' }], cachedScenes: [], cachedInputs: [] };
                        }
                        return { mappings: [], cachedScenes: [], cachedInputs: [] };
                    }),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(obsService.setCurrentScene).toHaveBeenCalledExactlyOnceWith('GamingScene');
        expect(result).toMatchObject({
            key: 'Numpad1',
            success: true,
            actionType: 'scene',
            target: 'GamingScene',
        });
        expect(mainWindow.webContents.send).toHaveBeenCalledWith('action:executed', result);

    });

    test('falls back to empty mappings when the active collection has no persisted entry', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            { activeCollection: 'Unknown', mappings: [] },
            {
                settingsService: {
                    getCollection: vi.fn(() => ({ mappings: [], cachedScenes: [], cachedInputs: [] })),
                },
            }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(obsService.setCurrentScene).not.toHaveBeenCalled();
        expect(result).toEqual({ key: 'Numpad1', success: true });
        expect(mainWindow.webContents.send).not.toHaveBeenCalled();

    });

    test('falls back to empty mappings when no active collection is set', async () => {

        const { dispatcher, obsService, mainWindow } = createDispatcher(
            { activeCollection: '', mappings: [] }
        );

        const result = await dispatcher.dispatch('Numpad1');

        expect(obsService.setCurrentScene).not.toHaveBeenCalled();
        expect(result).toEqual({ key: 'Numpad1', success: true });
        expect(mainWindow.webContents.send).not.toHaveBeenCalled();

    });

});
