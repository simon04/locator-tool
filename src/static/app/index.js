angular.module('app', ['ui.router', 'll-leaflet', 'LocalStorageModule', 'gettext']);

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
