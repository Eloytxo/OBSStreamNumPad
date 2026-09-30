<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConnectionStore } from './stores/connection';
import { useSettingsStore } from './stores/settings';
import AppHeader from './components/AppHeader.vue';
import ActionToast from './components/ActionToast.vue';

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const connectionStore = useConnectionStore();
const settingsStore = useSettingsStore();

let unsubscribeConnectionLost = null;

function syncHtmlLang(lang) {
    document.documentElement.lang = lang;
}

watch(locale, syncHtmlLang);

// Redirect to the summary view when the active/selected collection changes,
// so the user does not stay in the mapping editor for a different collection.
watch(
    () => settingsStore.currentCollection,
    () => {
        if (route.path !== '/summary' && route.path !== '/') {
            router.push('/summary');
        }
    }
);

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
.app-layout {
    height: 100vh;
    overflow: hidden;
}

.app-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.app-content > * {
    height: 100%;
    min-height: 0;
}
</style>