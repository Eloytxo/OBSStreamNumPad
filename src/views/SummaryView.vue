<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "../stores/settings";

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();

const selectedKey = ref(null);

const numpadLayout = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
];

function getMappingForKey(key) {
    return settingsStore.mappings.find(
        (mapping) => mapping.key === key || mapping.key === `Numpad${key}`
    );
}

function hasMapping(key) {
    return !!getMappingForKey(key);
}

function openPopup(key) {
    selectedKey.value = key;
}

function closePopup() {
    selectedKey.value = null;
}

function assignKey() {
    router.push({ path: "/main", query: { key: `Numpad${selectedKey.value}` } });
}

function getActionTypeLabel(actionType) {
    if (actionType === "scene") return t("main.type_scene");
    if (actionType === "media") return t("main.type_media");
    if (actionType === "toggle_visibility") return t("main.type_toggle_visibility");
    return actionType;
}
</script>

<template>
    <div class="summary-container">
        <div class="summary-card">
            <h1>{{ t("summary.title") }}</h1>

            <div class="numpad">
                <div v-for="row in numpadLayout" :key="row.join('')" class="numpad-row">
                    <button
                        v-for="key in row"
                        :key="key"
                        class="numpad-key"
                        :class="{ assigned: hasMapping(key) }"
                        @click="openPopup(key)"
                    >
                        <span class="key-number">{{ key }}</span>
                        <span v-if="hasMapping(key)" class="key-indicator"></span>
                    </button>
                </div>

                <div class="numpad-row">
                    <button
                        class="numpad-key numpad-key-zero"
                        :class="{ assigned: hasMapping('0') }"
                        @click="openPopup('0')"
                    >
                        <span class="key-number">0</span>
                        <span v-if="hasMapping('0')" class="key-indicator"></span>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="selectedKey" class="popup-overlay" @click.self="closePopup">
            <div class="popup-content">
                <button class="popup-close" @click="closePopup">×</button>
                <h2>{{ t("summary.key_label") }} {{ selectedKey }}</h2>

                <div v-if="hasMapping(selectedKey)" class="popup-mapping">
                    <div class="mapping-info">
                        <div class="mapping-row">
                            <span class="mapping-label">{{ t("main.type") }}:</span>
                            <span class="mapping-value">
                                {{ getActionTypeLabel(getMappingForKey(selectedKey).actionType) }}
                            </span>
                        </div>
                        <div class="mapping-row">
                            <span class="mapping-label">{{ t("main.target_col") }}:</span>
                            <span class="mapping-value">
                                {{ getMappingForKey(selectedKey).target }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-else class="popup-no-mapping">
                    <p>{{ t("summary.no_mapping") }}</p>
                    <button class="popup-assign-btn" @click="assignKey">
                        {{ t("summary.assign_key") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.summary-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    height: 100%;
}

.summary-card {
    background: var(--bg);
    border-radius: 12px;
    padding: 40px;
    box-shadow: var(--shadow);
    max-width: 500px;
    width: 100%;
}

.summary-card h1 {
    text-align: center;
    margin-bottom: 40px;
    font-size: 32px;
}

.numpad {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}

.numpad-row {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.numpad-key {
    width: 80px;
    height: 80px;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.numpad-key:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow);
    transform: translateY(-2px);
}

.numpad-key.assigned {
    border-color: #2d5a3d;
    background: rgba(45, 90, 61, 0.6);
}

.numpad-key.assigned:hover {
    border-color: #3d7a52;
    background: rgba(61, 122, 82, 0.7);
}

.numpad-key-zero {
    width: 184px;
}

.key-number {
    font-size: 32px;
    font-weight: 600;
    color: var(--text-h);
}

.key-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3d7a52;
}

.popup-overlay {
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

.popup-content {
    background: rgba(45, 45, 48, 0.95);
    border-radius: 12px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    position: relative;
    box-shadow: var(--shadow-card);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: var(--text);
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
}

.popup-close:hover {
    background: var(--border);
}

.popup-content h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    text-align: center;
}

.popup-mapping {
    margin-top: 20px;
}

.mapping-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mapping-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--code-bg);
    border-radius: 6px;
}

.mapping-label {
    font-weight: 600;
    color: var(--text);
}

.mapping-value {
    color: var(--text-h);
    font-weight: 500;
}

.popup-no-mapping {
    text-align: center;
    color: var(--text);
    font-size: 16px;
    padding: 20px;
    background: var(--code-bg);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.popup-assign-btn {
    width: auto;
    padding: 8px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-small);
    cursor: pointer;
    font-size: var(--font-size-body);
}

.popup-assign-btn:hover {
    background: var(--color-primary-hover);
}
</style>
