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

  withLatLng({lat, lng} = {}) {
    const coordinates = new LatLng(this.type, {lat, lng});
    coordinates._latOriginal = this._latOriginal;
    coordinates._lngOriginal = this._lngOriginal;
    return coordinates;
  }

  markAsSaved() {
    Object.assign(this, {
      _latOriginal: this.lat,
      _lngOriginal: this.lng
    });
  }

  get isDefined() {
    return this.lat && this.lng;
  }

  get isChanged() {
    return this.lat !== this._latOriginal || this.lng !== this._lngOriginal;
  }

  get isDefinedAndSaved() {
    return this.isDefined && !this.isChanged;
  }

  get csv() {
    return this.isDefined && [this.lat, this.lng].map(atLeastOneDecimalPlace).join(', ');
  }
}

function atLeastOneDecimalPlace(value) {
  return value % 1 === 0 ? value.toFixed(1) : value;
}
