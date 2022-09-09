import angular from 'angular';
import 'angular-animate';
import 'angular-local-storage';
import uiRouter, {StateProvider, UrlRouterProvider, LocationConfig} from '@uirouter/angularjs';
import 'angular-gettext';
import 'angular-lazy-img/dist/angular-lazy-img';
import octicons from 'octicons/build/sprite.octicons.svg?raw';

import './vendor';
import './vendor-leaflet';

import './style.css';
import appApi from './api';
import appComponents from './components';

angular.module('app', [
  'ngAnimate',
  uiRouter,
  'LocalStorageModule',
  'gettext',
  'angularLazyImg',
  appApi,
  appComponents
]);

angular.module('app').config(configure);
angular.module('app').config(routes);

configure.$inject = ['$compileProvider'];
function configure($compileProvider: ng.ICompileProvider) {
  $compileProvider.preAssignBindingsEnabled(true);
}

routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
function routes(
  $stateProvider: StateProvider,
  $urlRouterProvider: UrlRouterProvider,
  $locationProvider: LocationConfig
) {
  $locationProvider.hashPrefix('');
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
    component: 'ltGeolocate'
  });

  $stateProvider.state('map', {
    url: '/map?' + params,
    component: 'ltAllMap'
  });

  $stateProvider.state('gallery', {
    url: '/gallery?' + params,
    component: 'ltGallery'
  });

  $urlRouterProvider.otherwise('/');
}

/* eslint-env browser */
angular.element(document).ready(() => {
  const octiconsDiv = document.createElement('div');
  octiconsDiv.hidden = true;
  octiconsDiv.innerHTML = octicons;
  document.body.appendChild(octiconsDiv);
  angular.bootstrap(document, ['app'], {strictDi: true});
});
