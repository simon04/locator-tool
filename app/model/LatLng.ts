export class LatLng {
  constructor(
    public type: 'Location' | 'Object location',
    public lat: number | undefined,
    public lng: number | undefined,
    private readonly latOriginal?: number | undefined,
    private readonly lngOriginal?: number | undefined
  ) {
    if (arguments.length === 3) {
      // cannot use fallback value in constructor (latOriginal=lat) since latOriginal may need to be undefined
      this.latOriginal = lat;
      this.lngOriginal = lng;
    }
  }

  withLatLng(lat: number | undefined, lng: number | undefined): LatLng {
    return new LatLng(this.type, lat, lng, this.latOriginal, this.lngOriginal);
  }

  roundToPrecision(): LatLng {
    return new LatLng(
      this.type,
      roundToPrecision(this.lat),
      roundToPrecision(this.lng),
      this.latOriginal,
      this.lngOriginal
    );
  }

  rollback(): this {
    this.lat = this.latOriginal;
    this.lng = this.lngOriginal;
    return this;
  }

  commit(): LatLng {
    return new LatLng(this.type, this.lat, this.lng, this.lat, this.lng);
  }

  get isDefined(): boolean {
    return this.lat !== undefined && this.lng !== undefined;
  }

  get isChanged(): boolean {
    return this.lat !== this.latOriginal || this.lng !== this.lngOriginal;
  }

  get isDefinedAndSaved(): boolean {
    return this.isDefined && !this.isChanged;
  }

  get csv(): string {
    return this.lat !== undefined && this.lng !== undefined
      ? [this.lat, this.lng].map(atLeastOneDecimalPlace).join(', ')
      : '';
  }
}

function atLeastOneDecimalPlace(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : value;
}

function roundToPrecision(value: number | undefined, fractionDigits = 5): number | undefined {
  return typeof value === 'number' ? +value.toFixed(fractionDigits) : value;
}
