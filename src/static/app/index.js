angular.module('app', ['ui.router', 'll-leaflet', 'LocalStorageModule']);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('about', {
    url: '/',
    templateUrl: 'app/about/about.html'
  });

  $stateProvider.state('input', {
    url: '/input',
    templateUrl: 'app/input/input.html',
    controllerAs: '$ctrl',
    controller: 'InputController'
  });

  $stateProvider.state('list', {
    url: '/list?titles',
    templateUrl: 'app/list/list.html',
    controllerAs: '$ctrl',
    controller: 'ListController'
  });

  $urlRouterProvider.otherwise('/');
});
