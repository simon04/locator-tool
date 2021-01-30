import {CommonsFile, LatLng} from '../model';

interface EditApiResponse {
  result: {
    edit: {
      result: string;
    };
  };
}

export default class LtDataAuth {
  public static $inject = ['$http'];
  constructor(private $http: ng.IHttpService) {}

  editLocation(title: CommonsFile, coordinates: LatLng): ng.IPromise<void> {
    const {pageid} = title;
    const {type, lat, lng} = coordinates;
    return this.$http<EditApiResponse>({
      method: 'POST',
      url: '/locator-tool/edit',
      data: {type, lat, lng, pageid}
    }).then(response => {
      const data = response.data;
      if (!data.result || !data.result.edit || data.result.edit.result !== 'Success') {
        throw data;
      }
    });
  }
}
