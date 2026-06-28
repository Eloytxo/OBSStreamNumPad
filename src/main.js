import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { useSettingsStore } from './stores/settings';

import './assets/styles/theme.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

const settingsStore = useSettingsStore();
settingsStore.loadFromElectron().then(() => {
    i18n.global.locale.value = settingsStore.locale;
});

app.mount('#app');