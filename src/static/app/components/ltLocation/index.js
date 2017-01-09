export default {
  bindings: {
    type: '@',
    latLng: '<'
  },
  template: [
    '<code>{{',
    '<span>{{$ctrl.type || "Location"}}</span>',
    '<span ng-if="$ctrl.latLng"> | {{$ctrl.latLng.lat}} | {{$ctrl.latLng.lng}}</span>',
    '}}</code>'
  ].join('')
};
