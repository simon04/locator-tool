import {ref} from 'vue';

import type {FileDetails} from '../api/ltData';
import type {CommonsFile} from '../model';

type F = CommonsFile & FileDetails;

const modalDialogFile = ref<F>();

function setLazyImg($event: Event) {
  const img = $event.target as HTMLImageElement;
  const lazy = img.getAttribute('lazy-img');
  if (!lazy || img.src === lazy) return;
  img.src = lazy;
}

function prevImage(files: F[]) {
  const index = files.findIndex(f => f.file === modalDialogFile.value?.file);
  modalDialogFile.value = files.at(index - 1);
}

function nextImage(files: F[]) {
  const index = files.findIndex(f => f.file === modalDialogFile.value?.file);
  modalDialogFile.value = files.at((index + 1) % files.length);
}

export function useModalDialog() {
  return {modalDialogFile, setLazyImg, prevImage, nextImage};
}
