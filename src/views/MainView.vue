<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useObsStore } from "../stores/obs";
import { useSettingsStore } from "../stores/settings";

const { t } = useI18n();
const router = useRouter();
const obsStore = useObsStore();
const settingsStore = useSettingsStore();

const capturedKey = ref("");
const actionType = ref("scene");
const selectedTarget = ref("");
const listening = ref(false);
const sortKey = ref("key");
const sortDirection = ref("asc");

async function startListening() {
    // Pausar atajos globales para que el listener del renderer reciba la tecla
    await window.api.keyboard.stop();
    listening.value = true;
    capturedKey.value = "";
}

function handleKeyDown(event) {
    if (!listening.value) return;

    // Use event.code for consistent numpad key names (e.g., "Numpad1" instead of "1")
    const code = event.code;

    if (code.startsWith("Numpad") || code === "Enter" || code === "NumpadAdd" || code === "NumpadSubtract" || code === "NumpadMultiply" || code === "NumpadDivide" || code === "NumpadDecimal") {
        capturedKey.value = code;
        listening.value = false;
        event.preventDefault();
        // Reactivar atajos globales tras capturar la tecla
        window.api.keyboard.start();
    }
}

async function stopListening() {
    listening.value = false;
    // Reactivar atajos globales al cancelar la captura
    await window.api.keyboard.start();
}

async function addMapping() {
    if (!capturedKey.value || !selectedTarget.value) return;

    const mapping = {
        key: capturedKey.value,
        actionType: actionType.value,
        target: selectedTarget.value
    };

    const updatedMappings = [...settingsStore.mappings, mapping];
    await settingsStore.savePartial({ mappings: updatedMappings });

    capturedKey.value = "";
    selectedTarget.value = "";
}

function getNumpadDigit(key) {
    const match = key.match(/Numpad(\d)/);
    return match ? parseInt(match[1], 10) : null;
}

const sortedMappings = computed(() => {
    const list = [...settingsStore.mappings];

    if (!sortKey.value) {
        return list;
    }

    list.sort((a, b) => {
        let comparison = 0;

        if (sortKey.value === "key") {
            const digitA = getNumpadDigit(a.key);
            const digitB = getNumpadDigit(b.key);

            if (digitA !== null && digitB !== null) {
                comparison = digitA - digitB;
            } else {
                comparison = a.key.localeCompare(b.key);
            }
        } else if (sortKey.value === "type") {
            comparison = a.actionType.localeCompare(b.actionType);
        }

        return sortDirection.value === "asc" ? comparison : -comparison;
    });

    return list;
});

function toggleSort(column) {
    if (sortKey.value === column) {
        if (sortDirection.value === "asc") {
            sortDirection.value = "desc";
        } else {
            sortKey.value = null;
            sortDirection.value = "asc";
        }
    } else {
        sortKey.value = column;
        sortDirection.value = "asc";
    }
}

function sortIndicator(column) {
    if (sortKey.value !== column) {
        return "";
    }

    return sortDirection.value === "asc" ? "▲" : "▼";
}

async function deleteMapping(sortedIndex) {
    const mapping = sortedMappings.value[sortedIndex];

    if (!mapping) {
        return;
    }

    const originalIndex = settingsStore.mappings.indexOf(mapping);

    if (originalIndex === -1) {
        return;
    }

    const updatedMappings = settingsStore.mappings.filter((_, i) => i !== originalIndex);
    await settingsStore.savePartial({ mappings: updatedMappings });
}

function goBack() {
    router.push("/summary");
}

onMounted(async () => {
    document.addEventListener("keydown", handleKeyDown);
    await obsStore.fetchScenes();
    await obsStore.fetchInputs();
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
    // Si se sale de la vista mientras se está capturando, reactivar atajos
    if (listening.value) {
        window.api.keyboard.start();
    }
});

function getActionTypeLabel(actionType) {
    if (actionType === "scene") return t("main.type_scene");
    if (actionType === "media") return t("main.type_media");
    if (actionType === "toggle_visibility") return t("main.type_toggle_visibility");
    return actionType;
}

function getMediaInputs() {
    return obsStore.inputs.filter(
        (input) => input.inputKind === "ffmpeg_source" || input.inputKind === "vlc_source"
    );
}
</script>

<template>
    <div class="main-container">
        <div class="main-card">
            <h1>{{ t("main.title") }}</h1>

            <div class="mapping-form">
                <div class="form-group">
                    <label>{{ t("main.capture_key") }}</label>

                    <div class="key-capture">
                        <button
                            class="capture-button"
                            :class="{ listening: listening }"
                            @click="startListening"
                        >
                            {{ listening ? t("main.listening") : (capturedKey || t("main.press_key")) }}
                        </button>

                        <button
                            v-if="listening"
                            class="cancel-button"
                            @click="stopListening"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>{{ t("main.action_type") }}</label>

                    <select v-model="actionType">
                        <option value="scene">{{ t("main.type_scene") }}</option>
                        <option value="media">{{ t("main.type_media") }}</option>
                        <option value="toggle_visibility">{{ t("main.type_toggle_visibility") }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>{{ t("main.target") }}</label>

                    <select v-model="selectedTarget">
                        <option value="" disabled>{{ t("main.select_target") }}</option>

                        <template v-if="actionType === 'scene'">
                            <option
                                v-for="scene in obsStore.scenes"
                                :key="scene.sceneName"
                                :value="scene.sceneName"
                            >
                                {{ scene.sceneName }}
                            </option>
                        </template>

                        <template v-else-if="actionType === 'toggle_visibility'">
                            <option
                                v-for="input in obsStore.inputs"
                                :key="input.inputName"
                                :value="input.inputName"
                            >
                                {{ input.inputName }}
                            </option>
                        </template>

                        <template v-else>
                            <option
                                v-for="input in getMediaInputs()"
                                :key="input.inputName"
                                :value="input.inputName"
                            >
                                {{ input.inputName }}
                            </option>
                        </template>
                    </select>
                </div>

                <button
                    class="add-button"
                    :disabled="!capturedKey || !selectedTarget"
                    @click="addMapping"
                >
                    {{ t("main.add_mapping") }}
                </button>
            </div>

            <div class="mappings-section">
                <h2>{{ t("main.mappings_list") }}</h2>

                <div v-if="settingsStore.mappings.length === 0" class="no-mappings">
                    {{ t("main.no_mappings") }}
                </div>

                <table v-else class="mappings-table">
                    <thead>
                        <tr>
                            <th class="sortable-header" @click="toggleSort('key')">
                                {{ t("main.key") }} <span class="sort-indicator">{{ sortIndicator('key') }}</span>
                            </th>
                            <th class="sortable-header" @click="toggleSort('type')">
                                {{ t("main.type") }} <span class="sort-indicator">{{ sortIndicator('type') }}</span>
                            </th>
                            <th>{{ t("main.target_col") }}</th>
                            <th>{{ t("main.actions") }}</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="(mapping, index) in sortedMappings"
                            :key="index"
                        >
                            <td>{{ mapping.key }}</td>
                            <td>{{ getActionTypeLabel(mapping.actionType) }}</td>
                            <td>{{ mapping.target }}</td>
                            <td>
                                <button
                                    class="delete-button"
                                    @click="deleteMapping(index)"
                                >
                                    {{ t("main.delete") }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button class="back-button" @click="goBack">
                {{ t("main.back") }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.sortable-header {
    cursor: pointer;
    user-select: none;
}

.sort-indicator {
    margin-left: 0.25rem;
}
</style>
