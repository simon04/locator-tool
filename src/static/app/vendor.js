import 'angular';
import 'angular-local-storage';
import 'angular-gettext';
import 'angular-ui-router';
import L from 'leaflet';
import 'leaflet-geosearch/src/js/l.control.geosearch.js';
import 'leaflet-geosearch/src/js/l.geosearch.provider.openstreetmap.js';
import 'angular-ll-leaflet';

import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/src/css/l.geosearch.css';

// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-269750768
delete L.Icon.Default.prototype._getIconUrl;
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});
