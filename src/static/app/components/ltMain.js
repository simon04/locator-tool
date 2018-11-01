import template from './ltMain.pug';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

class ltMain {
  constructor(
    ltData,
    $scope,
    $stateParams,
    ltDataAuth,
    $q,
    localStorageService,
    filterFilter,
    orderByFilter
  ) {
    Object.assign(this, {ltData, ltDataAuth, localStorageService, filterFilter});
    const {category, user, files} = $stateParams;
    Object.assign(this, {category, user, files});
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;

    const files$q = ltData.getFiles($stateParams);
    files$q.then(titles => ltData.getCoordinates(titles)).then(console.log)
    const fileDetails$q = files$q.then(titles => ltData.getCoordinates(titles)).then(titles => {
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

  _hasLocation(title) {
    return title.coordinates.isDefinedAndSaved || title.objectLocation.isDefinedAndSaved;
  }

  get filteredTitles() {
    let titles =
      this.showGeolocated || !this.titles
        ? this.titles
        : this.titles.filter(t => !this._hasLocation(t));
    titles = this.filterFilter(titles, this.filter);
    return titles;
  }

  get titlesDefinedAndSaved() {
    return this.titles ? this.titles.filter(this._hasLocation) : [];
  }

  get titlesDefinedAndSavedPercent() {
    return (100 * this.titlesDefinedAndSaved.length) / (this.titles || []).length;
  }

  keyPressedInList($event) {
    const titles = this.filteredTitles;
    const direction = keydownToDirection($event);
    const index = titles.indexOf(this.title);
    const newIndex = direction + index;
    if (newIndex >= 0 && titles[newIndex]) {
      this.title = titles[newIndex];
    }
  }

  titleChanged(title) {
    this.error = undefined;
    if (title && title.coordinates) {
      this.updateMapView(title.coordinates);
    }
    if (title && title.pageid) {
      this.ltData.getFileDetails(title.pageid).then(fileDetails => {
        Object.assign(title, fileDetails);
        const {lat, lng} = title.objectLocation;
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
  'filterFilter',
  'orderByFilter'
];

export default {
  template,
  controller: ltMain
};

function keydownToDirection($event) {
  if ($event && $event.keyCode) {
    switch ($event.keyCode) {
      case 39: // right
      case 40: // down
        $event.preventDefault();
        return 1;
      case 37: // left
      case 38: // up
        $event.preventDefault();
        return -1;
    }
  }
}
