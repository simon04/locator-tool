angular.module('app').component('ltLocation', {
  bindings: {
    latLng: '<'
  },
  template: [
    '<code>{{Location',
    '<span ng-if="$ctrl.latLng"> | {{$ctrl.latLng.lat}} | {{$ctrl.latLng.lng}}</span>',
    '}}</code>'
  ].join('')
});
