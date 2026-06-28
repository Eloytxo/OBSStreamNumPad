export {};

declare global {

    interface Window {

        api: {

            test(): Promise<string>;

            obs: {
                connect(connectionData: { host: string; port: number; password: string }): Promise<{ success: boolean; message: string }>;
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

        };

    }

}