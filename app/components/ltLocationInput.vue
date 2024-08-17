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
import {ref} from 'vue';
import {LatLng} from '../model';
import {t} from './useI18n';
import Save from 'bootstrap-icons/icons/save.svg?component';
import XSquare from 'bootstrap-icons/icons/x-square.svg?component';

const REGEXP = /(?<lat>[+-]?\d+\.?\d*)[,;\s]+(?<lng>[+-]?\d+\.?\d*)/;

const modelValue = defineModel<LatLng>({required: true});

const emit = defineEmits<{
  editLocation: [];
}>();
const type = ref(modelValue.value?.type);
const inputElement = ref<HTMLInputElement | null>(null);

function updateLatLng(viewValue: string | undefined) {
  if (viewValue === undefined) return;
  if (!type.value) {
    // keep track of coordinate type since it is lost
    // when returning undefined on invalid input
    const t = modelValue.value?.type;
    if (t) type.value = t;
  }
  const m = viewValue.match(REGEXP);
  const valid = !!m || !viewValue;
  inputElement.value?.classList?.toggle('is-invalid', !valid);
  if (!valid) return;

  modelValue.value = new LatLng(
    type.value!,
    m ? parseFloat(m.groups!.lat) : undefined,
    m ? parseFloat(m.groups!.lng) : undefined,
    modelValue.value.lat,
    modelValue.value.lng
  );
}

function rollback() {
  modelValue.value = modelValue.value?.rollback();
}
</script>
