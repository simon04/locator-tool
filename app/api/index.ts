import angular from 'angular';

import ltData from './ltData';
import ltDataAuth from './ltDataAuth';

export default angular.module('app.api', []).service({
  ltData,
  ltDataAuth
}).name;
