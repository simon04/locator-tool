angular.module('app', ['ui.router', 'll-leaflet', 'LocalStorageModule', 'gettext']);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('about', {
    url: '/',
    templateUrl: 'app/about/about.html'
  });

  $stateProvider.state('input', {
    url: '/input',
    component: 'ltFilesSelector'
  });

  $stateProvider.state('list', {
    url: '/list?titles',
    templateUrl: 'app/list/list.html',
    controllerAs: '$ctrl',
    controller: 'ListController'
  });

  $urlRouterProvider.otherwise('/');
});
