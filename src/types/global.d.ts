export {};

declare global {

    interface Window {

        api: {

            obs: {
                connect(connectionData: { host: string; port: number; password: string }): Promise<{ success: boolean; message: string }>;
                disconnect(): Promise<{ success: boolean; error?: string }>;
                getScenes(): Promise<{ success: boolean; scenes?: Array<{ sceneName: string }>; message?: string }>;
                getInputs(): Promise<{ success: boolean; inputs?: Array<{ inputName: string; inputKind: string }>; message?: string }>;
                getSceneCollectionList(): Promise<{ success: boolean; currentSceneCollectionName?: string; sceneCollections?: string[]; message?: string }>;
                getCurrentSceneCollection(): Promise<{ success: boolean; sceneCollectionName?: string; message?: string }>;
                onSceneCollectionChanged(cb: (data: { sceneCollectionName: string }) => void): () => void;
            };

            settings: {
                load(): Promise<{
                    host: string;
                    port: number;
                    password: string;
                    locale: string;
                    _schemaVersion?: number;
                    activeCollection?: string;
                    collections?: Record<string, { mappings: Array<{ key: string; actionType: string; target: string }>; cachedScenes: Array<{ sceneName: string }>; cachedInputs: Array<{ inputName: string; inputKind: string }> }>;
                    mappings?: Array<{ key: string; actionType: string; target: string }>;
                }>;
                save(data: Record<string, unknown>): Promise<{ success: boolean }>;
                migrateLegacyMappings(activeCollectionName: string): Promise<{ success: boolean; migrated: boolean; error?: string }>;
            };

            keyboard: {
                start(): Promise<{ success: boolean; message?: string }>;
                stop(): Promise<{ success: boolean }>;
                onActionExecuted(cb: (data: { key: string; success: boolean; error?: string }) => void): void;
            };

            window: {
                close(): Promise<void>;
                minimize(): Promise<void>;
                maximize(): Promise<void>;
                focus(): Promise<void>;
            };

        };

    }

}
