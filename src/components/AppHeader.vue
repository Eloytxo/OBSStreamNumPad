<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useConnectionStore } from '../stores/connection';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import logo from '../assets/images/logo.png';

const { t, locale } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();

const showDisconnectDialog = ref(false);

function changeLanguage(lang) {
    locale.value = lang;
    settingsStore.savePartial({ locale: lang });
}

function isConnected() {
    return connectionStore.status === CONNECTION_STATUS.CONNECTED;
}

function navigateTo(route) {
    router.push(route);
}

function minimizeWindow() {
    window.api.window.minimize();
}

function maximizeWindow() {
    window.api.window.maximize();
}

function closeWindow() {
    window.api.window.close();
}

function requestDisconnect() {
    showDisconnectDialog.value = true;
}

function cancelDisconnect() {
    showDisconnectDialog.value = false;
}

async function confirmDisconnect() {
    showDisconnectDialog.value = false;

    try {
        await window.api.keyboard.stop();
    } catch {
        // swallow errors — keyboard may already be stopped
    }

    try {
        await window.api.obs.disconnect();
    } catch {
        // swallow errors — OBS may be crashed/unresponsive
    }

    connectionStore.disconnect();
    router.push('/');
}
</script>

<template>
    <header class="app-header">
        <div class="header-top">
            <div class="header-logo">
                <img class="logo-image" :src="logo" alt="Logo" />
                <h2 class="header-title">{{ t('app.title') }}</h2>
            </div>
            <div class="header-top-right">
                <select
                    class="language-selector"
                    :value="locale"
                    @change="changeLanguage($event.target.value)"
                >
                    <option value="es">ES</option>
                    <option value="en">EN</option>
                </select>
                <div class="window-controls">
                    <button class="window-btn" @click="minimizeWindow" :title="t('header.minimize')">─</button>
                    <button class="window-btn" @click="maximizeWindow" :title="t('header.maximize')">□</button>
                    <button class="window-btn window-btn-close" @click="closeWindow" :title="t('header.close')">✕</button>
                </div>
            </div>
        </div>

        <div class="header-bottom" v-if="isConnected()">
            <div class="header-section">
                <button class="nav-button" @click="navigateTo('/summary')">
                    {{ t('header.summary') }}
                </button>
                <button class="nav-button" @click="navigateTo('/main')">
                    {{ t('header.assign_keys') }}
                </button>
            </div>

            <div class="header-section"></div>

            <div class="header-section">
                <div
                    class="connection-indicator"
                    :class="{ 'is-clickable': isConnected() }"
                    @click="isConnected() && requestDisconnect()"
                >
                    <span
                        class="status-dot"
                        :class="{ connected: isConnected() }"
                    ></span>
                    <span class="connection-text">
                        {{ isConnected() ? t('header.connected') : t('header.disconnected') }}
                    </span>
                </div>
            </div>
        </div>
    </header>

    <!-- Disconnect confirmation dialog -->
    <Teleport to="body">
        <div v-if="showDisconnectDialog" class="dialog-overlay" @click.self="cancelDisconnect">
            <div class="dialog-content">
                <h3>{{ t('header.disconnect_title') }}</h3>
                <p>{{ t('header.disconnect_confirm') }}</p>
                <div class="dialog-actions">
                    <button class="btn-cancel" @click="cancelDisconnect">
                        {{ t('header.disconnect_cancel') }}
                    </button>
                    <button class="btn-confirm" @click="confirmDisconnect">
                        {{ t('header.disconnect') }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.dialog-content {
    background: var(--color-surface);
    border-radius: var(--radius-medium);
    padding: var(--spacing-xl);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
}

.dialog-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-title);
    text-align: center;
}

.dialog-content p {
    color: var(--color-text-secondary);
    text-align: center;
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-body);
}

.dialog-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.dialog-actions button {
    width: auto;
    padding: var(--spacing-sm) var(--spacing-lg);
    margin-top: 0;
    border-radius: var(--radius-small);
    font-size: var(--font-size-body);
    cursor: pointer;
    border: 1px solid var(--color-border);
    transition: all 0.2s;
}

.btn-cancel {
    background: var(--color-surface-hover);
    color: var(--color-text);
}

.btn-cancel:hover {
    background: var(--color-border);
}

.btn-confirm {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
}

.btn-confirm:hover {
    background: #ff6b63;
    border-color: #ff6b63;
}
</style>
