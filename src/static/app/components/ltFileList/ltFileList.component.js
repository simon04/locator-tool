angular.module('app').component('ltFileList', {
  bindings: {
    title: '<',
    mapMarker: '<',
    editLocation: '&'
  },
  templateUrl: 'app/components/ltFileList/ltFileList.html'
});
