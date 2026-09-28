<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConnectionStore } from "../stores/connection";
import { useSettingsStore } from "../stores/settings";
import { CONNECTION_STATUS } from "../constants/connectionStatus";

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
                    <option value="es">{{ t("settings.language.es") }}</option>
                    <option value="en">{{ t("settings.language.en") }}</option>
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

    <!-- Clear mappings confirmation dialog -->
    <Teleport to="body">
        <div v-if="showClearDialog" class="dialog-overlay" @click.self="cancelClearMappings">
            <div class="dialog-content">
                <h3>{{ t("settings.clearMappings.confirmTitle") }}</h3>
                <p>{{ t("settings.clearMappings.confirmMessage") }}</p>
                <div class="dialog-actions">
                    <button class="btn-cancel" @click="cancelClearMappings">
                        {{ t("settings.clearMappings.cancelButton") }}
                    </button>
                    <button class="btn-confirm" @click="confirmClearMappings">
                        {{ t("settings.clearMappings.confirmButton") }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
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
