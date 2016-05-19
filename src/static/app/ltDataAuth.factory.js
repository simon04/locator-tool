angular.module('app').factory('ltDataAuth', function($http, $httpParamSerializer) {
  return {
    getUserInfo: getUserInfo,
    editLocation: editLocation
  };

  function getUserInfo() {
    return $http.get('/locator-tool/user').then(function(d) {
      return d.data && d.data.user;
    });
  }
  function editLocation(lat, lng, pageid) {
    return $http({
      method: 'POST',
      url: '/locator-tool/edit',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $httpParamSerializer({
        lat: lat,
        lng: lng,
        pageid: pageid
      })
    }).then(function(response) {
      var data = response.data;
      if (!data.result || !data.result.edit || data.result.edit.result !== 'Success') {
        throw data;
      }
    });
  }
});
