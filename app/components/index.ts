import angular from 'angular';
import 'angular-ll-leaflet';

import ltAbout from './ltAbout';
import ltAllMap from './ltAllMap';
import ltFileDetails from './ltFileDetails';
import ltFileThumbnail from './ltFileThumbnail';
import ltFilesSelector from './ltFilesSelector';
import ltLanguageSelector from './ltLanguageSelector';
import ltLocationInput from './ltLocationInput';
import ltGeolocate from './ltGeolocate';
import ltMap from './ltMap';
import ltNavbar from './ltNavbar';
import ltSpinner from './ltSpinner';
import ltUserInfo from './ltUserInfo';
import smartCoordinate from './smartCoordinate';

export default angular
  .module('app.components', ['ll-leaflet'])
  .component({
    ltAbout,
    ltAllMap,
    ltFileDetails,
    ltFileThumbnail,
    ltFilesSelector,
    ltLanguageSelector,
    ltLocationInput,
    ltGeolocate,
    ltMap,
    ltNavbar,
    ltSpinner,
    ltUserInfo
  })
  .directive({
    smartCoordinate
  }).name;
