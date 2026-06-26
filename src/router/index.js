import { createRouter, createWebHashHistory } from 'vue-router';

import ConnectionView from '../views/ConnectionView.vue';
import SettingsView from '../views/SettingsView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'connection',
      component: ConnectionView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
});

export default router;