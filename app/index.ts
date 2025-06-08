import {createApp} from 'vue';
import {createRouter, createWebHashHistory, RouteRecordInfo} from 'vue-router';
import App from './App.vue';
import {FilesOptions} from './api/ltData';

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

interface RouteNamedMap {
  about: RouteRecordInfo<'about', '/about', Record<never, never>, Record<never, never>>;
  select: RouteRecordInfo<'select', '/', FilesOptions, FilesOptions>;
  geolocate: RouteRecordInfo<'geolocate', '/geolocate', FilesOptions, FilesOptions>;
  map: RouteRecordInfo<'map', '/map', FilesOptions, FilesOptions>;
  gallery: RouteRecordInfo<'gallery', '/gallery', FilesOptions, FilesOptions>;
}

declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
  }
}

createApp(App).use(router).mount('#app');
