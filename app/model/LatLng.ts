export type LocationType = 'Location' | 'Object location';

export class LatLng {
  public lat?: number;
  public lng?: number;
  _latOriginal?: number;
  _lngOriginal?: number;

  constructor(public type: LocationType, {lat, lng}: {lat?: number; lng?: number}) {
    this.lat = lat;
    this.lng = lng;
    this._latOriginal = lat;
    this._lngOriginal = lng;
  }

  withLatLng(
    {lat, lng}: {lat?: number; lng?: number} = {lat: this._latOriginal, lng: this._lngOriginal}
  ): LatLng {
    const coordinates = new LatLng(this.type, {lat, lng});
    coordinates._latOriginal = this._latOriginal;
    coordinates._lngOriginal = this._lngOriginal;
    return coordinates;
  }

  markAsSaved(): void {
    this._latOriginal = this.lat;
    this._lngOriginal = this.lng;
  }

  get isDefined(): boolean {
    return this.lat !== undefined && this.lng !== undefined;
  }

  get isChanged(): boolean {
    return this.lat !== this._latOriginal || this.lng !== this._lngOriginal;
  }

  get isDefinedAndSaved(): boolean {
    return this.isDefined && !this.isChanged;
  }

  get csv(): string {
    return this.isDefined ? [this.lat, this.lng].map(atLeastOneDecimalPlace).join(', ') : '';
  }
}

function atLeastOneDecimalPlace(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : value;
}
