import * as angular from 'angular';

import ltData from './ltData';
import ltDataAuth from './ltDataAuth';

export default angular
  .module('app.api', [])
  .service('ltData', ltData)
  .service('ltDataAuth', ltDataAuth).name;
