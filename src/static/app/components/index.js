import angular from 'angular';
import llLeaflet from 'angular-ll-leaflet';

import ltAbout from './ltAbout';
import ltAllMap from './ltAllMap';
import ltFileDetails from './ltFileDetails';
import ltFilesSelector from './ltFilesSelector';
import ltLanguageSelector from './ltLanguageSelector';
import ltLocation from './ltLocation';
import ltLocationInput from './ltLocationInput';
import ltMain from './ltMain';
import ltMap from './ltMap';
import ltSpinner from './ltSpinner';
import ltUserInfo from './ltUserInfo';
import smartCoordinate from './smartCoordinate';

export default angular
  .module('app.components', [llLeaflet])
  .component('ltAbout', ltAbout)
  .component('ltAllMap', ltAllMap)
  .component('ltFileDetails', ltFileDetails)
  .component('ltFilesSelector', ltFilesSelector)
  .component('ltLanguageSelector', ltLanguageSelector)
  .component('ltLocation', ltLocation)
  .component('ltLocationInput', ltLocationInput)
  .component('ltMain', ltMain)
  .component('ltMap', ltMap)
  .component('ltSpinner', ltSpinner)
  .component('ltUserInfo', ltUserInfo)
  .directive('smartCoordinate', smartCoordinate).name;
