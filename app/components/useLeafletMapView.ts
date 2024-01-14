import {useLocalStorage} from '@vueuse/core';

export type MapView = {
  lat: number;
  lng: number;
  zoom: number;
};

const DEFAULT_MAP_VIEW = {
  lat: 51.505,
  lng: -0.09,
  zoom: 13
};

export function useLeafletMapView() {
  return useLocalStorage<MapView>('mapView', DEFAULT_MAP_VIEW);
}
