<script setup>
import { ref } from "vue";
import { useConnectionStore } from "../stores/connection";
import { useI18n } from "vue-i18n";
import { CONNECTION_STATUS } from "../constants/connectionStatus";

const { t } = useI18n();
const message = ref("");
const connectionStore = useConnectionStore();
connectionStore.error = "";
connectionStore.status = CONNECTION_STATUS.IDLE;
async function connect() {
  const result = await window.api.obs.connect({
    host: connectionStore.host,
    port: connectionStore.port,
    password: connectionStore.password,
  });

  if (result.success) {
    connectionStore.status = CONNECTION_STATUS.CONNECTED;
  } else {
    connectionStore.status = CONNECTION_STATUS.DISCONNECTED;
    connectionStore.error = result.message;
  }

  message.value = result.message;
}
</script>

<template>
  <div class="connection-container">
    <div class="connection-card">
      <h1>{{ t("app.title") }}</h1>

      <form @submit.prevent="connect">
        <div class="form-group">
          <label for="host">
            {{ t("connection.host") }}
          </label>

          <input id="host" v-model="connectionStore.host" type="text" />
        </div>

        <div class="form-group">
          <label for="port">
            {{ t("connection.port") }}
          </label>

          <input id="port" v-model="connectionStore.port" type="number" />
        </div>

        <div class="form-group">
          <label for="password">
            {{ t("connection.password") }}
          </label>

          <input
            id="password"
            v-model="connectionStore.password"
            type="password"
          />
        </div>

        <button type="submit">
          {{ t("connection.connect") }}
        </button>
      </form>

      <div
        v-if="connectionStore.status !== CONNECTION_STATUS.IDLE"
        class="connection-status"
      >
        <span
          class="status-dot"
          :class="{
            connected: connectionStore.status === CONNECTION_STATUS.CONNECTED,
          }"
        ></span>

        <span>
          {{ message }}
        </span>
      </div>
    </div>
  </div>
</template>
