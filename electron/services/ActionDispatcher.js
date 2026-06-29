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
     * Busca el mapping para la tecla normalizada y ejecuta la acción en OBS.
     * Envía feedback al renderer vía IPC 'action:executed'.
     *
     * @param {string} normalizedKey - Tecla ya normalizada (ej. "Numpad1")
     * @returns {Promise<{key:string,success:boolean,error?:string}>}
     */
    async dispatch(normalizedKey) {

        // Leer mappings del store en cada keypress (sin cache)
        const mappings = this.settingsService.get('mappings') || [];

        // Primera coincidencia gana
        const mapping = mappings.find(m => m.key === normalizedKey);

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

                // Paso 1: Obtener la escena actual
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

                        // Paso 2: Resolver sceneItemId del source en la escena actual
                        const itemIdResult = await this.obsService.getSceneItemId(mapping.target, sceneName);

                        if (!itemIdResult.success) {

                            // Source no está en la escena actual → no-op
                            console.warn(`[ActionDispatcher] Source "${mapping.target}" no encontrado en la escena "${sceneName}" — no-op`);
                            result = {
                                success: true
                            };

                        } else {

                            const sceneItemId = itemIdResult.data;

                            // Paso 3: Leer estado actual
                            const enabledResult = await this.obsService.getSceneItemEnabled(sceneItemId, sceneName);

                            if (!enabledResult.success) {

                                result = {
                                    success: false,
                                    message: `No se pudo leer el estado del item: ${enabledResult.message}`
                                };

                            } else {

                                const currentEnabled = enabledResult.data;

                                // Paso 4: Invertir visibilidad
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

        const outcome = {
            key: normalizedKey,
            success: result.success,
            ...(result.message && { error: result.message })
        };

        // Enviar feedback al renderer
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {

            this.mainWindow.webContents.send('action:executed', outcome);

        }

        return outcome;

    }

}

export default ActionDispatcher;
