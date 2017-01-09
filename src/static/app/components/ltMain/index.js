import template from './ltMain.html';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

class ltMain {
  constructor(ltData, $scope, $stateParams, ltDataAuth, $filter, $q, localStorageService) {
    Object.assign(this, {ltData, ltDataAuth, localStorageService});
    this.mapObjectLocation = {};
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;

    const files$q = $q((resolve, reject) => {
      if ($stateParams.files) {
        resolve($stateParams.files);
      }
      if ($stateParams.user) {
        ltData.getFilesForUser($stateParams.user).then(resolve);
      } else if ($stateParams.category) {
        ltData.getFilesForCategory($stateParams.category).then(resolve);
      } else {
        reject();
      }
    });
    const fileDetails$q = files$q.then(ltData.getCoordinates).then((titles) => {
      this.titles = $filter('orderBy')(titles, 'file');
      this.showGeolocated = this.titles.length <= 5;
      // select first visible title
      this.title = this.titles.filter((title) => this.showGeolocated || !title.coordinates.lat)[0];
    });
    this.loading$q = $q.all([files$q, fileDetails$q]);

    $scope.$watch('$ctrl.title', (title) => this.titleChanged(title));
    $scope.$watch('$ctrl.mapView', (mapView) => this.mapViewChanged(mapView), true);
  }

  titleChanged(title) {
    this.error = undefined;
    if (title && title.coordinates) {
      this.updateMapView(title.coordinates);
    }
    if (title && title.pageid) {
      this.ltData.getObjectLocation(title.pageid).then((objectLocation = {}) => {
        const {lat, lng} = objectLocation;
        Object.assign(this.mapObjectLocation, {lat, lng});
        if (!(title.coordinates && title.coordinates.lat)) {
          this.updateMapView({lat, lng});
        }
      });
    }
  }

  mapViewChanged(mapView) {
    this.localStorageService.set('mapView', mapView);
  }

  updateMapView({lat, lng}) {
    if (lat && lng) {
      Object.assign(this.mapView, {lat, lng});
    }
  }
}
ltMain.$inject = [
  'ltData', '$scope', '$stateParams', 'ltDataAuth', '$filter', '$q', 'localStorageService'];

export default {
  template,
  controller: ltMain
};
