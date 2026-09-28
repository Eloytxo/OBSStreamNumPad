import { ActionType } from '../../core/actions.js';

class ActionDispatcher {

    /**
     * @param {import('./OBSService.js').default} obsService
     * @param {import('./SettingsService.js').default} settingsService
     * @param {import('electron').BrowserWindow} mainWindow
     */
    constructor(obsService, settingsService, mainWindow) {

        this.obsService = obsService;
        this.settingsService = settingsService;
        this.mainWindow = mainWindow;

    }

    /**
     * Looks up the mapping for the normalized key and executes the action in OBS.
     * Sends feedback to the renderer via the 'action:executed' IPC channel.
     *
     * @param {string} normalizedKey - Already normalized key (e.g. "Numpad1")
     * @returns {Promise<{key:string,success:boolean,error?:string}>}
     */
    async dispatch(normalizedKey) {

        // Read mappings from the store on every keypress (no cache)
        const mappings = this.settingsService.get('mappings') || [];

        const matches = mappings.filter(m => m.key === normalizedKey);

        if (matches.length > 1) {
            console.warn(`[ActionDispatcher] Múltiples mappings detectados para la tecla ${normalizedKey}:`, JSON.stringify(matches));
        }

        // First match wins
        const mapping = matches[0];

        if (!mapping) {

            console.log(`[ActionDispatcher] Tecla sin mapping: ${normalizedKey}`);

            return {
                key: normalizedKey,
                success: true
            };

        }

        console.log(`[ActionDispatcher] Mapping encontrado:`, JSON.stringify(mapping));

        let result;

        try {

            if (mapping.actionType === ActionType.SCENE) {

                console.log(`[ActionDispatcher] Llamando setCurrentScene con sceneName: "${mapping.target}"`);
                result = await this.obsService.setCurrentScene(mapping.target);
                console.log(`[ActionDispatcher] Resultado setCurrentScene:`, result);

            } else if (mapping.actionType === ActionType.MEDIA) {

                console.log(`[ActionDispatcher] Llamando triggerMediaAction con inputName: "${mapping.target}", action: "RESTART"`);
                result = await this.obsService.triggerMediaAction(mapping.target, 'RESTART');
                console.log(`[ActionDispatcher] Resultado triggerMediaAction:`, result);

            } else if (mapping.actionType === ActionType.TOGGLE_VISIBILITY) {

                console.log(`[ActionDispatcher] TOGGLE_VISIBILITY para source: "${mapping.target}"`);

                // Step 1: Get the current scene
                const sceneListResult = await this.obsService.getSceneList();

                if (!sceneListResult.success) {

                    result = {
                        success: false,
                        message: `No se pudo obtener la escena actual: ${sceneListResult.message}`
                    };

                } else {

                    const sceneName = sceneListResult.currentProgramSceneName;

                    if (!sceneName) {

                        result = {
                            success: false,
                            message: 'No se encontró la escena activa'
                        };

                    } else {

                        // Step 2: Resolve the source's sceneItemId in the current scene
                        const itemIdResult = await this.obsService.getSceneItemId(mapping.target, sceneName);

                        if (!itemIdResult.success) {

                            // Source is not in the current scene → no-op
                            console.warn(`[ActionDispatcher] Source "${mapping.target}" no encontrado en la escena "${sceneName}" — no-op`);
                            result = {
                                success: true
                            };

                        } else {

                            const sceneItemId = itemIdResult.data;

                            // Step 3: Read the current state
                            const enabledResult = await this.obsService.getSceneItemEnabled(sceneItemId, sceneName);

                            if (!enabledResult.success) {

                                result = {
                                    success: false,
                                    message: `No se pudo leer el estado del item: ${enabledResult.message}`
                                };

                            } else {

                                const currentEnabled = enabledResult.data;

                                // Step 4: Toggle visibility
                                result = await this.obsService.setSceneItemEnabled(sceneItemId, sceneName, !currentEnabled);

                            }

                        }

                    }

                }

            } else {

                console.warn(`[ActionDispatcher] Tipo de acción desconocido: ${mapping.actionType}`);

                result = {
                    success: false,
                    message: `Unknown action type: ${mapping.actionType}`
                };

            }

        } catch (error) {

            console.error(`[ActionDispatcher] Error ejecutando acción:`, error);
            result = {
                success: false,
                message: error.message
            };

        }

        const actionLabels = {
            scene: 'Escena',
            media: 'Media',
            toggle_visibility: 'Visibilidad'
        };

        const outcome = {
            key: normalizedKey,
            success: result.success,
            actionType: mapping.actionType,
            target: mapping.target,
            actionLabel: actionLabels[mapping.actionType] || mapping.actionType,
            ...(result.message && { error: result.message })
        };

        // Send feedback to the renderer
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {

            this.mainWindow.webContents.send('action:executed', outcome);

        }

        return outcome;

    }

}

export default ActionDispatcher;
