// @vitest-environment happy-dom
import {mount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, it} from 'vite-plus/test';

import {LatLng} from '../model';
import ltLocationInput from './ltLocationInput.vue';

function mountInput() {
  let modelValue = new LatLng('Location', 47.1, 11.2);
  const wrapper: VueWrapper = mount(ltLocationInput, {
    props: {
      modelValue,
      // emulate v-model
      'onUpdate:modelValue': (value: LatLng) => {
        modelValue = value;
        return wrapper.setProps({modelValue});
      }
    }
  });
  const input = wrapper.get('input');
  const [discardButton, saveButton] = wrapper.findAll('button');
  const model = () => modelValue;
  return {wrapper, input, discardButton, saveButton, model};
}

describe('ltLocationInput', () => {
  it('displays the location', () => {
    const {input, saveButton} = mountInput();
    expect(input.element.value).toBe('47.1, 11.2');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('parses the typed location on blur', async () => {
    const {input, saveButton, model} = mountInput();
    await input.setValue('48.5; 12.5');
    await input.trigger('blur');
    expect(model()).toMatchObject({type: 'Location', lat: 48.5, lng: 12.5, isChanged: true});
    expect(input.element.value).toBe('48.5, 12.5');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('parses the pasted location', async () => {
    const {input, saveButton, model} = mountInput();
    await input.trigger('paste', {clipboardData: {getData: () => '48.5, 12.5'}});
    expect(model()).toMatchObject({lat: 48.5, lng: 12.5, isChanged: true});
    expect(input.element.value).toBe('48.5, 12.5');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('keeps the pasted location changed on blur', async () => {
    const {input, saveButton, model} = mountInput();
    await input.trigger('paste', {clipboardData: {getData: () => '48.5, 12.5'}});
    // clicking the save button blurs the input first
    await input.trigger('blur');
    expect(model()).toMatchObject({lat: 48.5, lng: 12.5, isChanged: true});
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('parses a GeoHack URL', async () => {
    const {input, model} = mountInput();
    await input.setValue(
      'https://geohack.toolforge.org/geohack.php?pagename=Foo&params=47.54427805_S_12.14066878_W_globe:Earth_&language=en-gb'
    );
    await input.trigger('blur');
    expect(model()).toMatchObject({lat: -47.54427805, lng: -12.14066878});
  });

  it('rejects an invalid location', async () => {
    const {input, saveButton, model} = mountInput();
    await input.setValue('foo');
    await input.trigger('blur');
    expect(input.classes()).toContain('is-invalid');
    expect(model()).toMatchObject({lat: 47.1, lng: 11.2, isChanged: false});
    expect(saveButton.attributes('disabled')).toBeDefined();

    await input.setValue('48.5, 12.5');
    await input.trigger('blur');
    expect(input.classes()).not.toContain('is-invalid');
  });

  it('removes the location when emptied', async () => {
    const {input, saveButton, model} = mountInput();
    await input.setValue('');
    await input.trigger('blur');
    expect(model()).toMatchObject({lat: undefined, lng: undefined, isChanged: true});
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('is unchanged when the original location is entered again', async () => {
    const {input, saveButton, model} = mountInput();
    await input.setValue('48.5, 12.5');
    await input.trigger('blur');
    await input.setValue('47.1, 11.2');
    await input.trigger('blur');
    expect(model().isChanged).toBe(false);
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('discards the changes', async () => {
    const {input, discardButton, saveButton, model} = mountInput();
    await input.setValue('48.5, 12.5');
    await input.trigger('blur');
    await discardButton.trigger('click');
    expect(model()).toMatchObject({type: 'Location', lat: 47.1, lng: 11.2, isChanged: false});
    expect(input.element.value).toBe('47.1, 11.2');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('emits editLocation on save', async () => {
    const {wrapper, input, saveButton} = mountInput();
    await input.setValue('48.5, 12.5');
    await input.trigger('blur');
    await saveButton.trigger('click');
    expect(wrapper.emitted('editLocation')).toHaveLength(1);
  });
});
