<template>
  <div class="input-group">
    <input
      ref="inputElement"
      :value="modelValue.csv"
      class="form-control"
      type="text"
      @blur="updateLatLng(($event.target as HTMLInputElement).value)"
      @paste="updateLatLng($event.clipboardData?.getData('text'))"
    />
    <button
      class="btn btn-secondary"
      type="button"
      :title="t('Discard')"
      @click="modelValue && emit('update:modelValue', modelValue.rollback())"
    >
      <svg class="octicon">
        <use xlink:href="#x"></use>
      </svg>
    </button>
    <button
      class="btn btn-success"
      type="button"
      :title="t('Save')"
      :disabled="!modelValue?.isChanged"
      @click="emit('editLocation')"
    >
      <svg class="octicon">
        <use xlink:href="#git-commit"></use>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {LatLng} from '../model';
import {t} from './useI18n';

const REGEXP = /(?<lat>[+-]?\d+\.?\d*)[,;\s]+(?<lng>[+-]?\d+\.?\d*)/;

const emit = defineEmits<{
  'update:modelValue': [value: LatLng];
  editLocation: [];
}>();
const props = defineProps<{modelValue: LatLng}>();
const type = ref(props.modelValue?.type);
const inputElement = ref<HTMLInputElement | null>(null);

function updateLatLng(viewValue: string | undefined) {
  if (viewValue === undefined) return;
  if (!type.value) {
    // keep track of coordinate type since it is lost
    // when returning undefined on invalid input
    const t = props.modelValue?.type;
    if (t) type.value = t;
  }
  const m = viewValue.match(REGEXP);
  const valid = !!m || !viewValue;
  inputElement.value?.classList?.toggle('is-invalid', !valid);
  if (!valid) return;

  const newValue = new LatLng(
    type.value!,
    m ? parseFloat(m.groups!.lat) : undefined,
    m ? parseFloat(m.groups!.lng) : undefined,
    props.modelValue.lat,
    props.modelValue.lng
  );
  emit('update:modelValue', newValue);
}
</script>
