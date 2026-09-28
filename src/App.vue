<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConnectionStore } from './stores/connection';
import AppHeader from './components/AppHeader.vue';
import ActionToast from './components/ActionToast.vue';

const router = useRouter();
const { locale } = useI18n();
const connectionStore = useConnectionStore();

let unsubscribeConnectionLost = null;

function syncHtmlLang(lang) {
    document.documentElement.lang = lang;
}

watch(locale, syncHtmlLang);

onMounted(() => {
    syncHtmlLang(locale.value);

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