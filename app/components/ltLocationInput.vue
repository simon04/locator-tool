<template>
  <div class="input-group">
    <input
      ref="inputElement"
      :value="modelValue.csv"
      class="form-control"
      type="text"
      @blur="updateLatLng(($event.target as HTMLInputElement).value)"
      @paste="
        updateLatLng($event.clipboardData?.getData('text'));
        $event.preventDefault();
      "
    />
    <button
      class="btn btn-outline-secondary"
      type="button"
      :title="t('Discard')"
      @click="rollback()"
    >
      <XSquare />
    </button>
    <button
      class="btn btn-outline-success"
      type="button"
      :title="t('Save')"
      :disabled="!modelValue?.isChanged"
      @click="emit('editLocation')"
    >
      <Save />
    </button>
  </div>
</template>

<script setup lang="ts">
import Save from 'bootstrap-icons/icons/save.svg?component';
import XSquare from 'bootstrap-icons/icons/x-square.svg?component';
import {ref} from 'vue';

import type {LatLng} from '../model';
import {t} from './useI18n';

// Support lat,lon
// Support https://geohack.toolforge.org/geohack.php?pagename=Category:War_memorial,_Schwoich&params=47.54427805_N_12.14066878_E_globe:Earth_&language=en-gb
const REGEXP = /(?<lat>[+-]?\d+\.?\d*)(_(?<ns>[NS]))?[_,;\s]+(?<lng>[+-]?\d+\.?\d*)(_(?<ew>[EW]))?/;

const modelValue = defineModel<LatLng>({required: true});

const emit = defineEmits<{
  editLocation: [];
}>();
const inputElement = ref<HTMLInputElement | null>(null);

function updateLatLng(viewValue: string | undefined) {
  if (viewValue === undefined) return;
  const m = viewValue.match(REGEXP);
  const valid = !!m || !viewValue;
  inputElement.value?.classList?.toggle('is-invalid', !valid);
  if (!valid) return;

  modelValue.value = modelValue.value.withLatLng(
    m?.groups ? parseFloat(m.groups.lat) * (m.groups.ns === 'S' ? -1 : 1) : undefined,
    m?.groups ? parseFloat(m.groups.lng) * (m.groups.ew === 'W' ? -1 : 1) : undefined
  );
}

function rollback() {
  modelValue.value = modelValue.value?.rollback();
}
</script>
