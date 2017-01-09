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

  setLatLng({lat, lng}, overwriteOriginal) {
    Object.assign(this, {lat, lng});
    if (overwriteOriginal) {
      Object.assign(this, {
        _latOriginal: lat,
        _lngOriginal: lng
      });
    }
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
