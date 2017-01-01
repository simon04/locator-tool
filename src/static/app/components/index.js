import angular from 'angular';

import ltAbout from './ltAbout';
import ltFileDetails from './ltFileDetails';
import ltFilesSelector from './ltFilesSelector';
import ltLanguageSelector from './ltLanguageSelector';
import ltLocation from './ltLocation';
import ltMain from './ltMain';
import ltMap from './ltMap';
import ltUserInfo from './ltUserInfo';

export default angular
  .module('app.components', ['ll-leaflet'])
  .component('ltAbout', ltAbout)
  .component('ltFileDetails', ltFileDetails)
  .component('ltFilesSelector', ltFilesSelector)
  .component('ltLanguageSelector', ltLanguageSelector)
  .component('ltLocation', ltLocation)
  .component('ltMain', ltMain)
  .component('ltMap', ltMap)
  .component('ltUserInfo', ltUserInfo)
  .name;
