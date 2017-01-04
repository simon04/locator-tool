import template from './ltMain.html';

export default {
  template,
  controller: ltMain
};

ltMain.$inject = [
  'ltData', '$scope', '$stateParams', 'ltDataAuth', '$filter', 'localStorageService'];
function ltMain(ltData, $scope, $stateParams, ltDataAuth, $filter, localStorageService) {
  const vm = this;
  vm.mapMarker = {};
  vm.mapObjectLocation = {};
  vm.editLocation = editLocation;
  ltData.getCoordinates($stateParams.titles).then((titles) => {
    vm.titles = $filter('orderBy')(titles, 'file');
    vm.showGeolocated = vm.titles.length <= 5;
    // select first visible title
    vm.title = vm.titles.filter((title) => vm.showGeolocated || !title.coordinates.lat)[0];
  });

  $scope.$watch('$ctrl.title', (title) => {
    vm.error = undefined;
    if (title && title.pageid) {
      ltData.getObjectLocation(title.pageid).then((objectLocation = {}) => {
        const {lat, lng} = objectLocation;
        Object.assign(vm.mapObjectLocation, {lat, lng});
        if (!(title.coordinates && title.coordinates.lat)) {
          updateMapView({lat, lng});
        }
      });
    }
  });
  $scope.$watch('$ctrl.title.coordinates', (coords = {}) => {
    const {lat, lng} = coords;
    updateMapView({lat, lng});
    Object.assign(vm.mapMarker, {lat, lng});
  });

  vm.mapView = localStorageService.get('mapView') || {
    lat: 51.505,
    lng: -0.09,
    zoom: 13
  };
  $scope.$watch('$ctrl.mapView', (mapView) => localStorageService.set('mapView', mapView), true);

  function updateMapView({lat, lng}) {
    if (lat && lng) {
      Object.assign(vm.mapView, {lat, lng});
    }
  }

  function editLocation(title) {
    vm.error = undefined;
    const {lat, lng} = vm.mapMarker;
    return ltDataAuth.editLocation(lat, lng, title.pageid)
    .then(() => {
      title.coordinates = Object.assign(title.coordinates || {}, {lat, lng});
    }, (error) => {
      vm.error = error;
    });
  }
}
