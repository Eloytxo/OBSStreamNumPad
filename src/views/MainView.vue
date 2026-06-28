<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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

function startListening() {
    listening.value = true;
    capturedKey.value = "";
}

function handleKeyDown(event) {
    if (!listening.value) return;

    const key = event.key;

    if (key.startsWith("Numpad") || (key >= "0" && key <= "9") || key === "Enter" || key === "+" || key === "-" || key === "*" || key === "/" || key === ".") {
        capturedKey.value = key;
        listening.value = false;
        event.preventDefault();
    }
}

function stopListening() {
    listening.value = false;
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

async function deleteMapping(index) {
    const updatedMappings = settingsStore.mappings.filter((_, i) => i !== index);
    await settingsStore.savePartial({ mappings: updatedMappings });
}

function goBack() {
    router.push("/");
}

onMounted(async () => {
    document.addEventListener("keydown", handleKeyDown);
    await obsStore.fetchScenes();
    await obsStore.fetchInputs();
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
});

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
                            <th>{{ t("main.key") }}</th>
                            <th>{{ t("main.type") }}</th>
                            <th>{{ t("main.target_col") }}</th>
                            <th>{{ t("main.actions") }}</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="(mapping, index) in settingsStore.mappings"
                            :key="index"
                        >
                            <td>{{ mapping.key }}</td>
                            <td>{{ mapping.actionType === "scene" ? t("main.type_scene") : t("main.type_media") }}</td>
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
