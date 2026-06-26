<script setup>
import { ref } from 'vue';

const message = ref('');

async function testIPC() {
    message.value = await window.api.system.test();
}
</script>

<template>

    <h1>OBSStreamNumPad</h1>

    <button @click="testIPC">
        Test IPC
    </button>

    <p>{{ message }}</p>

</template>