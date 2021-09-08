import {CommonsFile, LatLng, User} from '../model';

interface UserApiResponse {
  user: string;
}

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

  getUserInfo(): ng.IPromise<User> {
    return this.$http.get<UserApiResponse>('/user').then(d => d?.data?.user);
  }

  editLocation(title: CommonsFile, coordinates: LatLng): ng.IPromise<void> {
    const {pageid} = title;
    const {type, lat, lng} = coordinates;
    return this.$http<EditApiResponse>({
      method: 'POST',
      url: '/edit',
      data: {type, lat, lng, pageid}
    }).then(response => {
      const data = response.data;
      if (!data.result || !data.result.edit || data.result.edit.result !== 'Success') {
        throw data;
      }
    });
  }

  get loginURL(): string {
    return '/login?next=' + encodeURIComponent('/' + location.hash);
  }

  get logoutURL(): string {
    return '/logout?next=' + encodeURIComponent('/' + location.hash);
  }
}
