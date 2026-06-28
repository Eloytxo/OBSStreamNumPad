<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConnectionStore } from "../stores/connection";
import { useSettingsStore } from "../stores/settings";
import { useObsStore } from "../stores/obs";
import { CONNECTION_STATUS } from "../constants/connectionStatus";

const { t } = useI18n();
const router = useRouter();
const connectionStore = useConnectionStore();
const settingsStore = useSettingsStore();
const obsStore = useObsStore();

const errorMessage = ref("");

connectionStore.status = CONNECTION_STATUS.IDLE;

async function connect() {
    errorMessage.value = "";
    connectionStore.status = CONNECTION_STATUS.CONNECTING;

    const result = await window.api.obs.connect({
        host: connectionStore.host,
        port: connectionStore.port,
        password: connectionStore.password,
    });

    if (result.success) {
        connectionStore.status = CONNECTION_STATUS.CONNECTED;
        obsStore.setConnected(true);

        await settingsStore.savePartial({
            host: connectionStore.host,
            port: connectionStore.port,
            password: connectionStore.password
        });

        router.push("/main");
    } else {
        connectionStore.status = CONNECTION_STATUS.DISCONNECTED;
        errorMessage.value = result.message;
    }
}

function isConnecting() {
    return connectionStore.status === CONNECTION_STATUS.CONNECTING;
}
</script>

<template>
    <div class="connection-container">
        <div class="connection-card">
            <h1>{{ t("app.title") }}</h1>
            <p class="subtitle">{{ t("app.subtitle") }}</p>

            <form @submit.prevent="connect">
                <div class="form-group">
                    <label for="host">
                        {{ t("connection.host") }}
                    </label>

                    <input
                        id="host"
                        v-model="connectionStore.host"
                        type="text"
                        :disabled="isConnecting()"
                    />
                </div>

                <div class="form-group">
                    <label for="port">
                        {{ t("connection.port") }}
                    </label>

                    <input
                        id="port"
                        v-model="connectionStore.port"
                        type="number"
                        :disabled="isConnecting()"
                    />
                </div>

                <div class="form-group">
                    <label for="password">
                        {{ t("connection.password") }}
                    </label>

                    <input
                        id="password"
                        v-model="connectionStore.password"
                        type="password"
                        :disabled="isConnecting()"
                    />
                </div>

                <button type="submit" :disabled="isConnecting()">
                    <span v-if="isConnecting()" class="spinner"></span>
                    {{ isConnecting() ? t("connection.connecting") : t("connection.connect") }}
                </button>
            </form>

            <p v-if="errorMessage" class="error-message">
                {{ t("connection.error_connection") }}: {{ errorMessage }}
            </p>

            <div
                v-if="connectionStore.status !== CONNECTION_STATUS.IDLE && !isConnecting()"
                class="connection-status"
            >
                <span
                    class="status-dot"
                    :class="{
                        connected: connectionStore.status === CONNECTION_STATUS.CONNECTED,
                    }"
                ></span>

                <span>
                    {{ connectionStore.status === CONNECTION_STATUS.CONNECTED
                        ? t("connection.status_connected")
                        : t("connection.status_disconnected")
                    }}
                </span>
            </div>
        </div>
    </div>
</template>
