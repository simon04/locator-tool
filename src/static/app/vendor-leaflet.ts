import * as L from 'leaflet';
import 'leaflet-providers';
import 'leaflet-control-geocoder';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

L.TileLayer.Provider.providers.mapyCZ = {
  url: 'https://mapserver.mapy.cz/{variant}/{z}-{x}-{y}',
  options: {
    maxZoom: 20,
    attribution: ['mapy.cz', 'seznam.cz', 'bing.com']
      .map(url => ` <a href="https://${url}" target="_blank">${url}</a>`)
      .join(', '),
    variant: 'bing'
  }
};
