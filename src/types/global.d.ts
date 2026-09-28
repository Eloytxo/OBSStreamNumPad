export {};

declare global {

    interface Window {

        api: {

            obs: {
                connect(connectionData: { host: string; port: number; password: string }): Promise<{ success: boolean; message: string }>;
                disconnect(): Promise<{ success: boolean; error?: string }>;
                getScenes(): Promise<{ success: boolean; scenes?: Array<{ sceneName: string }>; message?: string }>;
                getInputs(): Promise<{ success: boolean; inputs?: Array<{ inputName: string; inputKind: string }>; message?: string }>;
            };

            settings: {
                load(): Promise<{
                    host: string;
                    port: number;
                    password: string;
                    locale: string;
                    mappings: Array<{ key: string; actionType: string; target: string }>;
                }>;
                save(data: Record<string, unknown>): Promise<{ success: boolean }>;
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
