export default class LatLng {
  constructor(type, {lat, lng}) {
    Object.assign(this, {
      type,
      lat,
      lng,
      _latOriginal: lat,
      _lngOriginal: lng
    });
  }

  setLatLng({lat, lng}) {
    Object.assign(this, {lat, lng});
  }

  discard() {
    Object.assign(this, {lat: this._latOriginal, lng: this._lngOriginal});
  }

  get isDefined() {
    return this.lat && this.lng;
  }

  get isChanged() {
    return this.lat !== this._latOriginal || this.lng !== this._lngOriginal;
  }

  get csv() {
    return this.isDefined && [this.lat, this.lng].join(', ');
  }
}
