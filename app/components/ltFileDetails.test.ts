// @vitest-environment happy-dom
import {enableAutoUnmount, mount, type VueWrapper} from '@vue/test-utils';
import {afterEach, describe, expect, it, vi} from 'vite-plus/test';
import {nextTick, ref} from 'vue';

import {clearCache} from '../api/fetchJSON';
import type {FileDetails} from '../api/imageinfo';
import {editLocation} from '../api/ltDataAuth';
import {type CommonsFile, LatLng} from '../model';
import ltFileDetails from './ltFileDetails.vue';

vi.mock('../api/ltDataAuth', () => ({editLocation: vi.fn()}));
vi.mock('../api/fetchJSON', () => ({clearCache: vi.fn()}));

const file: CommonsFile & FileDetails = {
  pageid: 42,
  file: 'File:Example.jpg',
  url: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
  coordinates: new LatLng('Location', 47.1, 11.2),
  objectLocation: new LatLng('Object location', undefined, undefined),
  categories: []
};

function mockEditLocation(result: unknown, statusCode = 200, error: unknown = null) {
  vi.mocked(editLocation).mockResolvedValue({
    data: ref(result),
    error: ref(error),
    statusCode: ref(statusCode)
  } as never);
}

const success = {result: {edit: {result: 'Success'}}};

function mountDetails(
  coordinates = new LatLng('Location', 47.1, 11.2),
  objectLocation = new LatLng('Object location', undefined, undefined)
) {
  const models = {coordinates, objectLocation};
  const wrapper: VueWrapper = mount(ltFileDetails, {
    props: {
      file,
      coordinates,
      objectLocation,
      // emulate v-model
      'onUpdate:coordinates': (value: LatLng) => {
        models.coordinates = value;
        return wrapper.setProps({coordinates: value});
      },
      'onUpdate:objectLocation': (value: LatLng) => {
        models.objectLocation = value;
        return wrapper.setProps({objectLocation: value});
      }
    }
  });
  // the save button of the file, followed by discard/save of each location input
  const buttons = wrapper.findAll('button');
  return {wrapper, saveButton: buttons[0], saveCoordinatesButton: buttons[2], models};
}

// the components listen to the keyboard shortcuts of the window
enableAutoUnmount(afterEach);
afterEach(() => vi.clearAllMocks());

describe('ltFileDetails', () => {
  it('disables saving an unchanged file', () => {
    const {saveButton} = mountDetails();
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('saves the changed locations', async () => {
    mockEditLocation(success);
    const {wrapper, saveButton, models} = mountDetails(
      new LatLng('Location', 47.1, 11.2),
      new LatLng('Object location', undefined, undefined).withLatLng(48.5, 12.5)
    );
    expect(saveButton.attributes('disabled')).toBeUndefined();
    await saveButton.trigger('click');
    await vi.waitFor(() => expect(clearCache).toHaveBeenCalled());
    expect(editLocation).toHaveBeenCalledWith(file, [
      expect.objectContaining({type: 'Object location', lat: 48.5, lng: 12.5})
    ]);
    expect(models.objectLocation).toMatchObject({lat: 48.5, lng: 12.5, isChanged: false});
    expect(models.coordinates).toMatchObject({lat: 47.1, lng: 11.2, isChanged: false});
    await nextTick();
    expect(saveButton.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.alert-danger').exists()).toBe(false);
  });

  it('saves the changed locations on Ctrl+S', async () => {
    mockEditLocation(success);
    mountDetails(new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5));
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Control', ctrlKey: true}));
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 's', ctrlKey: true}));
    // the shortcut is watched, which runs before the keys are released
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keyup', {key: 's', ctrlKey: true}));
    window.dispatchEvent(new KeyboardEvent('keyup', {key: 'Control'}));
    await vi.waitFor(() => expect(editLocation).toHaveBeenCalledTimes(1));
    expect(editLocation).toHaveBeenCalledWith(file, [
      expect.objectContaining({type: 'Location', lat: 48.5, lng: 12.5})
    ]);
  });

  it('saves the location of a location input', async () => {
    mockEditLocation(success);
    const {saveCoordinatesButton, models} = mountDetails(
      new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5),
      new LatLng('Object location', undefined, undefined).withLatLng(1.5, 2.5)
    );
    await saveCoordinatesButton.trigger('click');
    await vi.waitFor(() => expect(clearCache).toHaveBeenCalled());
    expect(editLocation).toHaveBeenCalledWith(file, [
      expect.objectContaining({type: 'Location', lat: 48.5, lng: 12.5})
    ]);
    expect(models.coordinates.isChanged).toBe(false);
    expect(models.objectLocation.isChanged).toBe(true);
  });

  it('reports a failed edit', async () => {
    mockEditLocation({error: {code: 'protectedpage'}}, 200);
    const {wrapper, saveButton, models} = mountDetails(
      new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5)
    );
    await saveButton.trigger('click');
    await vi.waitFor(() => expect(wrapper.find('.alert-danger').exists()).toBe(true));
    expect(wrapper.find('.alert-danger').text()).toContain(
      '200 {"error":{"code":"protectedpage"}}'
    );
    expect(clearCache).not.toHaveBeenCalled();
    expect(models.coordinates).toMatchObject({lat: 48.5, lng: 12.5, isChanged: true});
  });

  it('reports a failed request', async () => {
    mockEditLocation(null, 403, 'Forbidden');
    const {wrapper, saveButton} = mountDetails(
      new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5)
    );
    await saveButton.trigger('click');
    await vi.waitFor(() => expect(wrapper.find('.alert-danger').exists()).toBe(true));
    expect(wrapper.find('.alert-danger').text()).toContain('403 "Forbidden"');
  });

  it('reports an exception', async () => {
    vi.mocked(editLocation).mockRejectedValue('Network error');
    const {wrapper, saveButton} = mountDetails(
      new LatLng('Location', 47.1, 11.2).withLatLng(48.5, 12.5)
    );
    await saveButton.trigger('click');
    await vi.waitFor(() => expect(wrapper.find('.alert-danger').exists()).toBe(true));
    expect(wrapper.find('.alert-danger').text()).toContain('"Network error"');
  });
});
