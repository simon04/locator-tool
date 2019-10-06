import {CommonsFile, LatLng, User} from '../model';

interface UserApiResponse {
  user: string;
}

export default class LtDataAuth {
  public static $inject = ['$http'];
  constructor(private $http: ng.IHttpService) {}

  getUserInfo(): ng.IPromise<User> {
    return this.$http.get<UserApiResponse>('/locator-tool/user').then(d => d.data && d.data.user);
  }

  editLocation(title: CommonsFile, coordinates: LatLng) {
    const {pageid} = title;
    const {type, lat, lng} = coordinates;
    return this.$http<any>({
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
