export {};

declare global {

    interface Window {

        api: {

            test(): Promise<string>;

        };

    }

}