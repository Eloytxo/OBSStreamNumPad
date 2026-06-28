<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings';
import { useConnectionStore } from '../stores/connection';
import { CONNECTION_STATUS } from '../constants/connectionStatus';

const { t, locale } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();

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
</script>

<template>
    <header class="app-header">
        <div class="header-top">
            <div class="header-logo">
                <span class="logo-placeholder">🎬</span>
                <h2 class="header-title">{{ t('app.title') }}</h2>
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

            <div class="header-section">
                <div class="connection-indicator">
                    <span
                        class="status-dot"
                        :class="{ connected: isConnected() }"
                    ></span>
                    <span class="connection-text">
                        {{ isConnected() ? t('header.connected') : t('header.disconnected') }}
                    </span>
                </div>
            </div>

            <div class="header-section">
                <select
                    class="language-selector"
                    :value="locale"
                    @change="changeLanguage($event.target.value)"
                >
                    <option value="es">ES</option>
                    <option value="en">EN</option>
                </select>
            </div>
        </div>
    </header>
</template>
