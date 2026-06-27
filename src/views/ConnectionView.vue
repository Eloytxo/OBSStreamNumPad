<script setup>
import { ref } from "vue";
import { useConnectionStore } from "../stores/connection";

const message = ref("");
const connectionStore = useConnectionStore();

async function connect() {
  const result = await window.api.obs.connect({
    host: connectionStore.host,
    port: connectionStore.port,
    password: connectionStore.password,
  });

  console.log(result);

  message.value = result.message;
}
</script>

<template>
  <div class="connection-container">
    <div class="connection-card">
      <h1>OBSStreamNumPad</h1>

      <form @submit.prevent="connect">
        <div class="form-group">
          <label for="host">Host</label>

          <input id="host" v-model="connectionStore.host" type="text" />
        </div>

        <div class="form-group">
          <label for="port">Puerto</label>

          <input id="port" v-model="connectionStore.port" type="number" />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>

          <input
            id="password"
            v-model="connectionStore.password"
            type="password"
          />
        </div>

        <button type="submit">Conectar</button>
      </form>

      <p>{{ message }}</p>
    </div>
  </div>
</template>
