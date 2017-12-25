import angular from 'angular';
import animate from 'angular-animate';
import localStorage from 'angular-local-storage';
import uiRouter from '@uirouter/angularjs';
import gettext from 'angular-gettext';

import './style.css';
import appApi from './api';
import appComponents from './components';

angular.module('app', [animate, uiRouter, localStorage, gettext, appApi, appComponents]);

angular.module('app').config(configure);
angular.module('app').config(routes);

configure.$inject = ['$compileProvider'];
function configure($compileProvider) {
  $compileProvider.preAssignBindingsEnabled(true);
}

routes.$inject = ['$stateProvider', '$urlRouterProvider'];
function routes($stateProvider, $urlRouterProvider) {
  $stateProvider.state('about', {
    url: '/about',
    component: 'ltAbout'
  });

  const params = [
    'files',
    'user',
    'userLimit',
    'userStart',
    'userEnd',
    'category',
    'categoryDepth'
  ].join('&');

  $stateProvider.state('select', {
    url: '/?' + params,
    component: 'ltFilesSelector'
  });

  $stateProvider.state('geolocate', {
    url: '/geolocate?' + params,
    component: 'ltMain'
  });

  $stateProvider.state('map', {
    url: '/map?' + params,
    component: 'ltAllMap'
  });

  $urlRouterProvider.otherwise('/');
}

/* eslint-env browser */
angular.element(document).ready(() => {
  angular.bootstrap(document, ['app'], {strictDi: true});
});
