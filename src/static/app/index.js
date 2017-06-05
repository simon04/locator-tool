import angular from 'angular';
import animate from 'angular-animate';
import localStorage from 'angular-local-storage';
import uiRouter from 'angular-ui-router';
import gettext from 'angular-gettext';

import './style.css';
import appApi from './api';
import appComponents from './components';

angular.module('app', [animate, uiRouter, localStorage, gettext, appApi, appComponents]);

angular.module('app').config(routes);

routes.$inject = ['$stateProvider', '$urlRouterProvider'];
function routes($stateProvider, $urlRouterProvider) {
  $stateProvider.state('about', {
    url: '/about',
    component: 'ltAbout'
  });

  $stateProvider.state('select', {
    url: '/?user&category&categoryDepth',
    component: 'ltFilesSelector'
  });

  $stateProvider.state('geolocate', {
    url: '/geolocate?files&user&category&categoryDepth',
    component: 'ltMain'
  });

  $stateProvider.state('map', {
    url: '/map?files&user&category&categoryDepth',
    component: 'ltAllMap'
  });

  $urlRouterProvider.otherwise('/');
}

/* eslint-env browser */
angular.element(document).ready(() => {
  angular.bootstrap(document, ['app'], {strictDi: true});
});
