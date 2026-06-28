<script setup>
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../stores/settings';
import { useConnectionStore } from '../stores/connection';
import { CONNECTION_STATUS } from '../constants/connectionStatus';

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();
const connectionStore = useConnectionStore();

function changeLanguage(lang) {
    locale.value = lang;
    settingsStore.savePartial({ locale: lang });
}

function isConnected() {
    return connectionStore.status === CONNECTION_STATUS.CONNECTED;
}
</script>

<template>
    <header class="app-header">
        <div class="header-left">
            <h2 class="header-title">{{ t('app.title') }}</h2>
        </div>

        <div class="header-right">
            <div class="connection-indicator">
                <span
                    class="status-dot"
                    :class="{ connected: isConnected() }"
                ></span>
                <span class="connection-text">
                    {{ isConnected() ? t('header.connected') : t('header.disconnected') }}
                </span>
            </div>

            <select
                class="language-selector"
                :value="locale"
                @change="changeLanguage($event.target.value)"
            >
                <option value="es">ES</option>
                <option value="en">EN</option>
            </select>
        </div>
    </header>
</template>
