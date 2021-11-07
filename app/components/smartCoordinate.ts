import {LatLng} from '../model';

export default function directive(): ng.IDirective {
  const REGEXP = /([+-]?\d+\.\d*)[,;\s]+([+-]?\d+\.\d*)/;

  return {
    require: 'ngModel',
    link: function (_scope: ng.IScope, _elm: JQLite, _attrs: ng.IAttributes, c?: ng.IController) {
      const ctrl = c as ng.INgModelController;
      let type: 'Location' | 'Object location';
      ctrl.$parsers.push(parser as ng.IModelParser);
      ctrl.$formatters.push(formatter as ng.IModelFormatter);

      function parser(viewValue: string): LatLng | undefined {
        if (!type) {
          // keep track of coordinate type since it is lost
          // when returning undefined on invalid input
          const t = (ctrl.$modelValue as LatLng | undefined)?.type;
          if (t) type = t;
        }
        const m = viewValue.match(REGEXP);
        ctrl.$setValidity('coordinate', !!m || ctrl.$isEmpty(viewValue));
        if (m || ctrl.$isEmpty(viewValue)) {
          return new LatLng(
            type,
            m ? parseFloat(m[1]) : undefined,
            m ? parseFloat(m[2]) : undefined
          );
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
