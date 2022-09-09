import template from './ltFileMetadata.html?raw';

class LtFileMetadataController implements ng.IComponentController {}

export default {
  bindings: {
    description: '<',
    file: '<'
  },
  controller: LtFileMetadataController,
  template
} as ng.IComponentOptions;
