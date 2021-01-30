import * as angular from 'angular';
import llLeaflet from 'angular-ll-leaflet';

import ltAbout from './ltAbout';
import ltAllMap from './ltAllMap';
import ltFileDetails from './ltFileDetails';
import ltFileThumbnail from './ltFileThumbnail';
import ltFilesSelector from './ltFilesSelector';
import ltLanguageSelector from './ltLanguageSelector';
import ltLocationInput from './ltLocationInput';
import ltMain from './ltMain';
import ltMap from './ltMap';
import ltNavbar from './ltNavbar';
import ltSpinner from './ltSpinner';
import ltUserInfo from './ltUserInfo';
import smartCoordinate from './smartCoordinate';

export default angular
  .module('app.components', [llLeaflet])
  .component({
    ltAbout,
    ltAllMap,
    ltFileDetails,
    ltFileThumbnail,
    ltFilesSelector,
    ltLanguageSelector,
    ltLocationInput,
    ltMain,
    ltMap,
    ltNavbar,
    ltSpinner,
    ltUserInfo
  })
  .directive({
    smartCoordinate
  }).name;
