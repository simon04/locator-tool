import template from './ltMain.pug';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

class ltMain {
  constructor(ltData, $scope, $stateParams, ltDataAuth, $q, localStorageService, orderByFilter) {
    Object.assign(this, {ltData, ltDataAuth, localStorageService});
    const {category, user, files} = $stateParams;
    Object.assign(this, {category, user, files});
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;

    const files$q = ltData.getFiles($stateParams);
    const fileDetails$q = files$q.then(ltData.getCoordinates).then(titles => {
      this.titles = orderByFilter(titles, title => title.file);
      this.showGeolocated = this.titles.length <= 5;
      // select first visible title
      this.title = this.titles.filter(title => this.showGeolocated || !title.coordinates.lat)[0];
    });
    this.loading$q = $q.all([files$q, fileDetails$q]);

    $scope.$watch('$ctrl.title', title => this.titleChanged(title));
    $scope.$watch('$ctrl.mapView', mapView => this.mapViewChanged(mapView), true);
    $scope.$on('coordinatesChanged', (_event, coordinates) => this.coordinatesChanged(coordinates));
  }

  get isLoading() {
    return this.loading$q && !this.loading$q.$$state.status;
  }

  get titlesDefinedAndSaved() {
    return (this.titles && this.titles.filter(title => title.coordinates.isDefinedAndSaved)) || [];
  }

  get titlesDefinedAndSavedPercent() {
    return 100 * this.titlesDefinedAndSaved.length / (this.titles || []).length;
  }

  titleChanged(title) {
    this.error = undefined;
    if (title && title.coordinates) {
      this.updateMapView(title.coordinates);
    }
    if (title && title.pageid) {
      this.ltData.getObjectLocation(title.pageid).then(objectLocation => {
        const {lat, lng} = objectLocation;
        title.objectLocation = objectLocation;
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

  coordinatesChanged(coordinates) {
    if (!coordinates) {
      return;
    } else if (coordinates.type === 'Location') {
      this.title.coordinates = this.title.coordinates.withLatLng(coordinates);
    } else if (coordinates.type === 'Object location') {
      this.title.objectLocation = this.title.objectLocation.withLatLng(coordinates);
    }
  }
}
ltMain.$inject = [
  'ltData',
  '$scope',
  '$stateParams',
  'ltDataAuth',
  '$q',
  'localStorageService',
  'orderByFilter'
];

export default {
  template,
  controller: ltMain
};
