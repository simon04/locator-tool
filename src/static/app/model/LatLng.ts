export class LatLng {
  public lat?: number;
  public lng?: number;
  _latOriginal?: number;
  _lngOriginal?: number;

  constructor(public type: string, {lat, lng}: {lat?: number; lng?: number}) {
    this.lat = lat;
    this.lng = lng;
    this._latOriginal = lat;
    this._lngOriginal = lng;
  }

  withLatLng({lat, lng} = {lat: this._latOriginal, lng: this._lngOriginal}) {
    const coordinates = new LatLng(this.type, {lat, lng});
    coordinates._latOriginal = this._latOriginal;
    coordinates._lngOriginal = this._lngOriginal;
    return coordinates;
  }

  markAsSaved() {
    this._latOriginal = this.lat;
    this._lngOriginal = this.lng;
  }

  get isDefined() {
    return this.lat !== undefined && this.lng !== undefined;
  }

  get isChanged() {
    return this.lat !== this._latOriginal || this.lng !== this._lngOriginal;
  }

  get isDefinedAndSaved() {
    return this.isDefined && !this.isChanged;
  }

  get csv() {
    return this.isDefined ? [this.lat, this.lng].map(atLeastOneDecimalPlace).join(', ') : '';
  }
}

function atLeastOneDecimalPlace(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : value;
}
