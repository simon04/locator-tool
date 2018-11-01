import {CommonsFile, LatLng} from '../model';
import LtData from '../api/ltData';
import {LtMapController} from './ltMap';
import template from './ltAllMap.pug';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

class LtAllMapController implements ng.IComponentController {
  bounds: LatLng[];
  mapView = DEFAULT_MAP_VIEW;
  titles: CommonsFile[];

  public static $inject = ['ltData', '$stateParams', 'localStorageService'];
  constructor(
    ltData: LtData,
    $stateParams: any,
    localStorageService: angular.local.storage.ILocalStorageService
  ) {
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;
    ltData
      .getFiles($stateParams)
      .then(titles => ltData.getCoordinates(titles))
      .then(titles => {
        this.titles = titles;
        const bounds = titles.map(title => title.coordinates).filter(c => c.isDefined);
        if (bounds.length) {
          this.bounds = bounds;
        }
      });
  }

  mapInit(L, map) {
    new LtMapController._mapInit(L, map);
  }
}

export default {
  template,
  controller: LtAllMapController
} as ng.IComponentOptions;
