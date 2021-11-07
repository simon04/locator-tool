import {LatLng} from '../model';

export default function directive(): ng.IDirective {
  const REGEXP = /([+-]?\d+\.\d*)[,;\s]+([+-]?\d+\.\d*)/;

  return {
    require: 'ngModel',
    link: function (
      _scope: ng.IScope,
      _elm: JQLite,
      _attrs: ng.IAttributes,
      ctrl: ng.INgModelController
    ) {
      let type: 'camera' | 'object';
      ctrl.$parsers.push(parser as ng.IModelParser);
      ctrl.$formatters.push(formatter as ng.IModelFormatter);

      function parser(viewValue: string): LatLng | undefined {
        if (!type) {
          // keep track of coordinate type since it is lost
          // when returning undefined on invalid input
          type = ctrl.$modelValue?.type;
        }
        const m = viewValue.match(REGEXP);
        ctrl.$setValidity('coordinate', !!m || ctrl.$isEmpty(viewValue));
        if (m || ctrl.$isEmpty(viewValue)) {
          return new LatLng(type, {
            lat: m ? parseFloat(m[1]) : undefined,
            lng: m ? parseFloat(m[2]) : undefined
          });
        } else {
          return undefined;
        }
      }

      function formatter(coordinate: LatLng) {
        return coordinate?.csv;
      }
    }
  };
}
