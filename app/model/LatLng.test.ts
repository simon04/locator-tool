import {describe, expect, it} from 'vite-plus/test';

import {LatLng} from './LatLng';

describe('LatLng', () => {
  it('is unchanged when created', () => {
    const latLng = new LatLng('Location', 47.1, 11.2);
    expect(latLng).toMatchObject({type: 'Location', lat: 47.1, lng: 11.2});
    expect(latLng.isDefined).toBe(true);
    expect(latLng.isChanged).toBe(false);
    expect(latLng.isDefinedAndSaved).toBe(true);
  });

  it('is undefined without coordinates', () => {
    for (const latLng of [
      new LatLng('Object location', undefined, undefined),
      new LatLng('Object location', 47.1, undefined),
      new LatLng('Object location', undefined, 11.2)
    ]) {
      expect(latLng.isDefined).toBe(false);
      expect(latLng.isDefinedAndSaved).toBe(false);
      expect(latLng.csv).toBe('');
    }
  });

  it('tracks the changes against the original coordinates', () => {
    const original = new LatLng('Location', 47.1, 11.2);
    const changed = original.withLatLng(48.5, 12.5);
    expect(changed).toMatchObject({type: 'Location', lat: 48.5, lng: 12.5});
    expect(changed.isChanged).toBe(true);
    expect(changed.isDefinedAndSaved).toBe(false);
    // the original coordinates are kept across several changes
    expect(changed.withLatLng(49, 13).isChanged).toBe(true);
    expect(changed.withLatLng(47.1, 11.2).isChanged).toBe(false);
    // a single coordinate changed
    expect(original.withLatLng(47.1, 13).isChanged).toBe(true);
    expect(original).toMatchObject({lat: 47.1, lng: 11.2});
  });

  it('tracks the addition and removal of coordinates', () => {
    const added = new LatLng('Object location', undefined, undefined).withLatLng(48.5, 12.5);
    expect(added.isChanged).toBe(true);
    expect(added.withLatLng(undefined, undefined).isChanged).toBe(false);

    const removed = new LatLng('Location', 47.1, 11.2).withLatLng(undefined, undefined);
    expect(removed.isDefined).toBe(false);
    expect(removed.isChanged).toBe(true);
  });

  it('accepts explicit original coordinates', () => {
    expect(new LatLng('Location', 48.5, 12.5, 47.1, 11.2).isChanged).toBe(true);
    expect(new LatLng('Location', 48.5, 12.5, 48.5, 12.5).isChanged).toBe(false);
    expect(new LatLng('Location', 48.5, 12.5, undefined, undefined).isChanged).toBe(true);
  });

  it('rolls back to the original coordinates', () => {
    const rolledBack = new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5).rollback();
    expect(rolledBack).toMatchObject({type: 'Location', lat: 47.1, lng: 11.2});
    expect(rolledBack.isChanged).toBe(false);

    const removed = new LatLng('Object location', undefined, undefined)
      .withLatLng(48.5, 12.5)
      .rollback();
    expect(removed).toMatchObject({type: 'Object location', lat: undefined, lng: undefined});
    expect(removed.isChanged).toBe(false);
  });

  it('commits the changed coordinates as the original ones', () => {
    const committed = new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5).commit();
    expect(committed).toMatchObject({type: 'Location', lat: 48.5, lng: 12.5});
    expect(committed.isChanged).toBe(false);
    expect(committed.rollback()).toMatchObject({lat: 48.5, lng: 12.5});
  });

  it('rounds to 5 decimal places', () => {
    const rounded = new LatLng('Location', 47.1, 11.2)
      .withLatLng(48.123456789, -12.987654321)
      .roundToPrecision();
    expect(rounded).toMatchObject({type: 'Location', lat: 48.12346, lng: -12.98765});
    expect(rounded.isChanged).toBe(true);
    expect(rounded.rollback()).toMatchObject({lat: 47.1, lng: 11.2});
    expect(new LatLng('Location', undefined, undefined).roundToPrecision()).toMatchObject({
      lat: undefined,
      lng: undefined
    });
  });

  it('formats the coordinates as CSV with at least one decimal place', () => {
    expect(new LatLng('Location', 47.1, 11.2).csv).toBe('47.1, 11.2');
    expect(new LatLng('Location', 47, -11).csv).toBe('47.0, -11.0');
    expect(new LatLng('Location', 0, 0).csv).toBe('0.0, 0.0');
    expect(new LatLng('Location', 48.12346, -12.98765).csv).toBe('48.12346, -12.98765');
  });
});
