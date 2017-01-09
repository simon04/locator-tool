dataAuth.$inject = ['$http'];
export default function dataAuth($http) {
  return {
    getUserInfo: getUserInfo,
    editLocation: editLocation
  };

  function getUserInfo() {
    return $http.get('/locator-tool/user').then(function(d) {
      return d.data && d.data.user;
    });
  }
  function editLocation(title, coordinates) {
    const {pageid} = title;
    const {type, lat, lng} = coordinates;
    return $http({
      method: 'POST',
      url: '/locator-tool/edit',
      data: {type, lat, lng, pageid}
    }).then(function(response) {
      const data = response.data;
      if (!data.result || !data.result.edit || data.result.edit.result !== 'Success') {
        throw data;
      }
    });
  }
}
