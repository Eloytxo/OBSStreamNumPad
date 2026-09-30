<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConnectionStore } from "../stores/connection";
import { useSettingsStore } from "../stores/settings";
import { CONNECTION_STATUS } from "../constants/connectionStatus";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const { t, locale } = useI18n();
const router = useRouter();
const connectionStore = useConnectionStore();
const settingsStore = useSettingsStore();

const showClearDialog = ref(false);

function saveLanguage() {
    settingsStore.savePartial({ locale: locale.value });
}

function goBack() {
    if (connectionStore.status === CONNECTION_STATUS.CONNECTED) {
        router.push("/summary");
    } else {
        router.push("/");
    }
}

function requestClearMappings() {
    showClearDialog.value = true;
}

function cancelClearMappings() {
    showClearDialog.value = false;
}

async function confirmClearMappings() {
    showClearDialog.value = false;
    await settingsStore.clearMappings();
}
</script>

<template>
    <div class="main-container">
        <div class="main-card">
            <h1>{{ t("settings.title") }}</h1>

            <div class="settings-section">
                <label for="language">
                    {{ t("settings.language") }}
                </label>

                <select
                    id="language"
                    v-model="locale"
                    @change="saveLanguage"
                >
                    <option value="es">{{ t("settings.languageOptions.es") }}</option>
                    <option value="en">{{ t("settings.languageOptions.en") }}</option>
                </select>
            </div>

            <div class="danger-zone">
                <h2>{{ t("settings.clearMappings.title") }}</h2>
                <p>{{ t("settings.clearMappings.description") }}</p>

                <button
                    class="danger-button"
                    @click="requestClearMappings"
                >
                    {{ t("settings.clearMappings.button") }}
                </button>
            </div>

            <button class="back-button" @click="goBack">
                {{ t("settings.back") }}
            </button>
        </div>
    </div>

    <ConfirmDialog
        :show="showClearDialog"
        :title="t('settings.clearMappings.confirmTitle')"
        :message="t('settings.clearMappings.confirmMessage')"
        :confirm-text="t('settings.clearMappings.confirmButton')"
        :cancel-text="t('settings.clearMappings.cancelButton')"
        confirm-class="danger"
        @confirm="confirmClearMappings"
        @cancel="cancelClearMappings"
    />
</template>

<style scoped>
.settings-section {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-lg);
}

.settings-section label {
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-secondary);
    font-size: var(--font-size-body);
}

.danger-zone {
    border: 1px solid var(--color-error);
    border-radius: var(--radius-medium);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    background: rgba(229, 83, 75, 0.08);
}

.danger-zone h2 {
    font-size: var(--font-size-subtitle);
    margin-bottom: var(--spacing-sm);
    color: var(--color-error);
}

.danger-zone p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-body);
    margin-bottom: var(--spacing-md);
}

.danger-button {
    background: var(--color-error);
    border: 1px solid var(--color-error);
}

.danger-button:hover:not(:disabled) {
    background: #ff6b63;
    border-color: #ff6b63;
}

.back-button {
    background: var(--color-surface-hover);
}

.back-button:hover:not(:disabled) {
    background: var(--color-border);
}

</style>
