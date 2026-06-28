import { createRouter, createWebHashHistory } from 'vue-router';

import ConnectionView from '../views/ConnectionView.vue';
import SummaryView from '../views/SummaryView.vue';
import SettingsView from '../views/SettingsView.vue';
import MainView from '../views/MainView.vue';
import { useConnectionStore } from '../stores/connection';
import { CONNECTION_STATUS } from '../constants/connectionStatus';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'connection',
      component: ConnectionView,
    },
    {
      path: '/summary',
      name: 'summary',
      component: SummaryView,
      beforeEnter: (to, from, next) => {
        const connectionStore = useConnectionStore();
        if (connectionStore.status === CONNECTION_STATUS.CONNECTED) {
          next();
        } else {
          next('/');
        }
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/main',
      name: 'main',
      component: MainView,
      beforeEnter: (to, from, next) => {
        const connectionStore = useConnectionStore();
        if (connectionStore.status === CONNECTION_STATUS.CONNECTED) {
          next();
        } else {
          next('/');
        }
      }
    },
  ],
});

export default router;