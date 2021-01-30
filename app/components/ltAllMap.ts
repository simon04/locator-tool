import {CommonsFile, LatLng} from '../model';
import LtData from '../api/ltData';
import {LtMapController} from './ltMap';
import template from './ltAllMap.html';
import * as L from 'leaflet';
import {StateParams} from '@uirouter/angularjs';

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

export type MapView = typeof DEFAULT_MAP_VIEW;

class LtAllMapController implements ng.IComponentController {
  bounds: LatLng[];
  mapView: MapView = DEFAULT_MAP_VIEW;
  titles: CommonsFile[];

  public static $inject = ['ltData', '$stateParams', 'localStorageService'];
  constructor(
    ltData: LtData,
    $stateParams: StateParams,
    localStorageService: angular.local.storage.ILocalStorageService
  ) {
    this.mapView = localStorageService.get('mapView') || DEFAULT_MAP_VIEW;
    ltData
      .getFiles($stateParams as any)
      .then(titles => ltData.getCoordinates(titles))
      .then(titles => {
        this.titles = titles;
        const bounds = titles.map(title => title.coordinates).filter(c => c.isDefined);
        if (bounds.length) {
          this.bounds = bounds;
        }
      });
  }

  mapInit(_L: unknown, map: L.Map) {
    new LtMapController._mapInit(map);
  }
}

export default {
  template,
  controller: LtAllMapController
} as ng.IComponentOptions;
