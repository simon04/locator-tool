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
  .component('ltAbout', ltAbout)
  .component('ltAllMap', ltAllMap)
  .component('ltFileDetails', ltFileDetails)
  .component('ltFileThumbnail', ltFileThumbnail)
  .component('ltFilesSelector', ltFilesSelector)
  .component('ltLanguageSelector', ltLanguageSelector)
  .component('ltLocationInput', ltLocationInput)
  .component('ltMain', ltMain)
  .component('ltMap', ltMap)
  .component('ltNavbar', ltNavbar)
  .component('ltSpinner', ltSpinner)
  .component('ltUserInfo', ltUserInfo)
  .directive('smartCoordinate', smartCoordinate).name;
