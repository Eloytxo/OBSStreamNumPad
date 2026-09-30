<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useSettingsStore } from '../stores/settings';
import { useConnectionStore } from '../stores/connection';
import { useObsStore } from '../stores/obs';
import SceneCollectionSelector from './SceneCollectionSelector.vue';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import ConfirmDialog from './ConfirmDialog.vue';
import logo from '../assets/images/logo.png';

const { t, locale } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();
const obsStore = useObsStore();

const showDisconnectDialog = ref(false);

const localOnlyCollections = computed(() => {
    return Object.keys(settingsStore.collections).filter(
        (name) => !obsStore.sceneCollections.includes(name)
    );
});

function handleDeleteLocalCollection(name) {
    settingsStore.deleteCollection(name);
}

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
                <button
                    class="settings-button"
                    :title="t('header.settings')"
                    @click="navigateTo('/settings')"
                >
                    <FontAwesomeIcon :icon="faGear" />
                </button>
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
            <div class="header-section header-section--selector">
                <SceneCollectionSelector
                    :collections="obsStore.sceneCollections"
                    :local-only-collections="localOnlyCollections"
                    :active-collection="obsStore.currentSceneCollection"
                    v-model="settingsStore.currentCollection"
                    @delete-local-collection="handleDeleteLocalCollection"
                />
            </div>

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

    <ConfirmDialog
        :show="showDisconnectDialog"
        :title="t('header.disconnect_title')"
        :message="t('header.disconnect_confirm')"
        :confirm-text="t('header.disconnect')"
        :cancel-text="t('header.disconnect_cancel')"
        confirm-class="danger"
        @confirm="confirmDisconnect"
        @cancel="cancelDisconnect"
    />
</template>

<style scoped>
.settings-button {
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-small);
    background: var(--color-background);
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
}

.settings-button:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
    border-color: var(--color-primary);
}
</style>
