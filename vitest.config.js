import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'node',
            globals: true,
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html', 'json'],
                include: ['core/**/*.js', 'electron/services/**/*.js'],
                exclude: ['**/*.test.js', '**/node_modules/**'],
            },
        },
    })
);
