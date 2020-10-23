import * as angular from 'angular';
import * as animate from 'angular-animate';
import * as localStorage from 'angular-local-storage';
import uiRouter, {StateProvider, UrlRouterProvider, LocationConfig} from '@uirouter/angularjs';
import * as gettext from 'angular-gettext';
import 'angular-lazy-img/dist/angular-lazy-img';
import octicons from 'octicons/build/sprite.octicons.svg';

import './style.css';
import appApi from './api';
import appComponents from './components';

angular.module('app', [
  animate,
  uiRouter,
  localStorage,
  gettext,
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
  document.getElementById('octicons').innerHTML = octicons;
  angular.bootstrap(document, ['app'], {strictDi: true});
});
