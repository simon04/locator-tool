import angular from 'angular';
import template from './ltGeolocate.html';
import {StateParams} from '@uirouter/core';
import LtData from '../api/ltData';
import LtDataAuth from '../api/ltDataAuth';
import {CommonsFile, LatLng} from '../model';
import {MapView} from './ltAllMap';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

class LtGeolocateController implements ng.IComponentController {
  category: string;
  error: unknown;
  files: string;
  filter = '';
  loading$q: ng.IPromise<unknown>;
  mapView: MapView = DEFAULT_MAP_VIEW;
  showGeolocated: boolean;
  title: CommonsFile;
  titles: CommonsFile[];
  user: string;

  public static $inject = [
    'ltData',
    '$scope',
    '$stateParams',
    'ltDataAuth',
    '$q',
    'localStorageService',
    'filterFilter',
    'orderByFilter'
  ];
  constructor(
    private ltData: LtData,
    private $scope: ng.IScope,
    private $stateParams: StateParams,
    private ltDataAuth: LtDataAuth,
    private $q: ng.IQService,
    private localStorageService: angular.local.storage.ILocalStorageService,
    private filterFilter: ng.IFilterFilter,
    private orderByFilter: ng.IFilterOrderBy
  ) {
    this.category = $stateParams.category;
    this.user = $stateParams.user;
    this.files = $stateParams.files;
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;
  }

  $onInit() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files$q = this.ltData.getFiles(this.$stateParams as any);
    const fileDetails$q = files$q
      .then(titles => this.ltData.getCoordinates(titles))
      .then(titles => {
        this.titles = this.orderByFilter(titles, title => title.file);
        this.showGeolocated = this.titles.length <= 5;
        // select first visible title
        this.title = this.filteredTitles[0];
      });
    this.loading$q = this.$q.all([files$q, fileDetails$q]);

    this.$scope.$watch('$ctrl.title', (title: CommonsFile) => this.titleChanged(title));
    this.$scope.$watch('$ctrl.mapView', (mapView: MapView) => this.mapViewChanged(mapView), true);
    this.$scope.$on('coordinatesChanged', (_event, coordinates) =>
      this.coordinatesChanged(coordinates)
    );
  }

  get isLoading() {
    const promise = this.loading$q;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !(promise as any)?.$$state?.status;
  }

  _hasLocation(title: CommonsFile) {
    return title.coordinates.isDefinedAndSaved || title.objectLocation.isDefinedAndSaved;
  }

  get filteredTitles(): CommonsFile[] {
    let titles = this.titles || [];
    titles = this.showGeolocated ? titles : titles.filter(t => !this._hasLocation(t));
    titles = this.filterFilter(titles, this.filter);
    return titles;
  }

  get titlesDefinedAndSaved(): CommonsFile[] {
    return this.titles ? this.titles.filter(this._hasLocation) : [];
  }

  get titlesDefinedAndSavedPercent(): number {
    return (100 * this.titlesDefinedAndSaved.length) / (this.titles || []).length;
  }

  keyPressedInList($event: KeyboardEvent): void {
    const titles = this.filteredTitles;
    const direction = keydownToDirection($event);
    if (direction === undefined) {
      return;
    }
    const index = titles.indexOf(this.title);
    const newIndex = direction + index;
    if (newIndex >= 0 && titles[newIndex]) {
      this.title = titles[newIndex];
      const target = $event.target as HTMLElement;
      window.requestAnimationFrame(() =>
        target.querySelectorAll('.list-group-item')?.[newIndex]?.scrollIntoView?.({block: 'center'})
      );
    }
  }

  titleChanged(title: CommonsFile): void {
    this.error = undefined;
    if (title?.coordinates) {
      this.updateMapView(title.coordinates);
    }
    if (title?.pageid) {
      this.ltData.getFileDetails(title.pageid).then(fileDetails => {
        angular.extend(title, fileDetails);
        const {lat, lng} = title.objectLocation;
        if (!title.coordinates?.lat) {
          this.updateMapView({lat, lng});
        }
      });
    }
  }

  mapViewChanged(mapView: MapView): void {
    this.localStorageService.set('mapView', mapView);
  }

  updateMapView({lat, lng}: {lat?: number; lng?: number}): void {
    if (lat && lng) {
      this.mapView.lat = lat;
      this.mapView.lng = lng;
    }
  }

  coordinatesChanged(coordinates: LatLng): void {
    if (!coordinates) {
      return;
    } else if (coordinates.type === 'Location') {
      this.title.coordinates = this.title.coordinates.withLatLng(coordinates);
    } else if (coordinates.type === 'Object location') {
      this.title.objectLocation = this.title.objectLocation.withLatLng(coordinates);
    }
  }
}

export default {
  template,
  controller: LtGeolocateController
} as ng.IComponentOptions;

function keydownToDirection($event: KeyboardEvent) {
  if ($event && $event.key) {
    switch ($event.key) {
      case 'Right':
      case 'ArrowRight':
      case 'Down':
      case 'ArrowDown':
        $event.preventDefault();
        return 1;
      case 'Left':
      case 'ArrowLeft':
      case 'Up':
      case 'ArrowUp':
        $event.preventDefault();
        return -1;
    }
  }
}
