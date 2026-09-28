<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConnectionStore } from './stores/connection';
import AppHeader from './components/AppHeader.vue';
import ActionToast from './components/ActionToast.vue';

const router = useRouter();
const connectionStore = useConnectionStore();

let unsubscribeConnectionLost = null;

onMounted(() => {
    unsubscribeConnectionLost = window.api.obs.onConnectionLost(({ reason }) => {
        connectionStore.connectionLost(reason);
        router.push('/');
    });
});

onUnmounted(() => {
    if (unsubscribeConnectionLost) {
        unsubscribeConnectionLost();
        unsubscribeConnectionLost = null;
    }
});
</script>


<template>
    <div class="app-layout">
        <AppHeader />
        <main class="app-content">
            <router-view />
        </main>
        <ActionToast />
    </div>
</template>

<style>
.app-content > * {
    height: 100%;
}
</style>