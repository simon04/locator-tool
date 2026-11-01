import {createApp} from 'vue';

import 'bootstrap/dist/css/bootstrap.css';
import {handleOAuthCallback} from './api/ltDataAuth';
import App from './App.vue';
import {createRouter} from './router';

// before the router reads the location
await handleOAuthCallback();

const router = createRouter({
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
    },
    {
      name: 'table',
      path: '/table',
      component: () => import('./components/ltTable.vue')
    }
  ]
});

createApp(App).use(router).mount('#app');
