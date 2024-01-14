import {createApp} from 'vue';
import {createRouter, createWebHashHistory} from 'vue-router';
import App from './App.vue';

import octicons from 'octicons/build/sprite.octicons.svg?raw';

import 'bootstrap/dist/css/bootstrap.css';
import 'octicons/build/octicons.css';
import './style.css';

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

const octiconsDiv = document.createElement('div');
octiconsDiv.hidden = true;
octiconsDiv.innerHTML = octicons;
document.body.appendChild(octiconsDiv);
createApp(App).use(router).mount('#app');
