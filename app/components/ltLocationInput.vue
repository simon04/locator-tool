<template>
  <div :class="{'has-error': !$valid}" class="input-group">
    <input
      v-model="latLngString"
      class="form-control"
      type="text"
      ng-model-options="{updateOn: 'default blur', debounce: {default: 2000, blur: 0}}"
      xxx-blur="latLngString = modelValue.csv"
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
import {ref, computed} from 'vue';
import {LatLng} from '../model';
import {t} from './useI18n';

const REGEXP = /([+-]?\d+\.\d*)[,;\s]+([+-]?\d+\.\d*)/;

const emit = defineEmits<{
  'update:modelValue': [value: LatLng];
  editLocation: [];
}>();
const props = defineProps<{modelValue: LatLng}>();
const type = ref(props.modelValue?.type);
const $valid = ref(true);

const latLngString = computed<string>({
  get: () => props.modelValue?.csv || '',
  set: viewValue => {
    if (!type.value) {
      // keep track of coordinate type since it is lost
      // when returning undefined on invalid input
      const t = props.modelValue?.type;
      if (t) type.value = t;
    }
    const m = viewValue.match(REGEXP);
    $valid.value = !!m || !viewValue;
    if (m || !viewValue) {
      emit(
        'update:modelValue',
        new LatLng(type.value!, m ? parseFloat(m[1]) : undefined, m ? parseFloat(m[2]) : undefined)
      );
    } else {
      // emit('update:modelValue', new LatLng(type.value!, undefined, undefined));
    }
  }
});
</script>
