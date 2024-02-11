<template>
  <div :class="{'has-error': !$valid}" class="input-group">
    <input
      :value="modelValue.csv"
      class="form-control"
      type="text"
      @blur="event => updateLatLng((event.target as HTMLInputElement).value)"
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
const $valid = ref(true);

function updateLatLng(viewValue: string) {
  if (!type.value) {
    // keep track of coordinate type since it is lost
    // when returning undefined on invalid input
    const t = props.modelValue?.type;
    if (t) type.value = t;
  }
  const m = viewValue.match(REGEXP);
  $valid.value = !!m || !viewValue;
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
