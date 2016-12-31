angular.module('app').component('ltFileDetails', {
  bindings: {
    title: '<',
    mapMarker: '<',
    editLocation: '&'
  },
  templateUrl: 'app/components/ltFileDetails/ltFileDetails.html'
});
