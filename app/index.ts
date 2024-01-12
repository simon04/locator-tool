import {createApp} from 'vue';
import {createRouter, createWebHashHistory} from 'vue-router';
import App from './App.vue';

import octicons from 'octicons/build/sprite.octicons.svg?raw';

import './vendor';
import './vendor-leaflet';
import './style.css';

const params = [
  'files',
  'user',
  'userLimit',
  'userStart',
  'userEnd',
  'category',
  'categoryDepth'
].join('&');

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes: [
    {
      name: 'about',
      path: '/about',
      component: () => import('./components/ltAbout')
    },
    {
      name: 'select',
      // path: '/?' + params,
      path: '/',
      component: () => import('./components/ltFilesSelector.vue')
    },
    {
      name: 'geolocate',
      // path: '/geolocate?' + params,
      path: '/geolocate',
      // template: '<lt-geolocate class="d-flex flex-grow-1"></lt-geolocate>'
      component: () => import('./components/ltGeolocate')
    },
    {
      name: 'map',
      // path: '/map?' + params,
      path: '/map',
      component: () => import('./components/ltAllMap')
    },
    {
      name: 'gallery',
      // path: '/gallery?' + params,
      path: '/gallery',
      component: () => import('./components/ltGallery')
    }
  ]
});

const octiconsDiv = document.createElement('div');
octiconsDiv.hidden = true;
octiconsDiv.innerHTML = octicons;
document.body.appendChild(octiconsDiv);
createApp(App).use(router).mount('#app');
