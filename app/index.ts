import {createApp} from 'vue';
import {createRouter, createWebHashHistory} from 'vue-router';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes: [
    {
      name: 'about',
      path: '/about',
      component: () => import('./components/ltAbout.vue')
    },
    {
      name: 'select',
      path: '/',
      component: () => import('./components/ltFilesSelector.vue')
    },
    {
      name: 'geolocate',
      path: '/geolocate',
      component: () => import('./components/ltGeolocate.vue')
    },
    {
      name: 'map',
      path: '/map',
      component: () => import('./components/ltAllMap.vue')
    },
    {
      name: 'gallery',
      path: '/gallery',
      component: () => import('./components/ltGallery.vue')
    }
  ]
});

createApp(App).use(router).mount('#app');
