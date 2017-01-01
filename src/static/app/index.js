import angular from 'angular';
import localStorage from 'angular-local-storage';
import uiRouter from 'angular-ui-router';
import gettext from 'angular-gettext';

import appApi from './api';
import appComponents from './components';

angular.module('app', [uiRouter, localStorage, gettext, appApi, appComponents]);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('about', {
    url: '/',
    component: 'ltAbout'
  });

  $stateProvider.state('input', {
    url: '/input',
    component: 'ltFilesSelector'
  });

  $stateProvider.state('list', {
    url: '/list?titles',
    component: 'ltMain'
  });

  $urlRouterProvider.otherwise('/');
});

/* eslint-env browser */
angular.element(document).ready(() => {
  angular.bootstrap(document, ['app'], {strictDi: false});
});
