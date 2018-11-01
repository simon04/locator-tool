import {LatLng} from '../model';

export default function directive() {
  const REGEXP = /([+-]?\d+\.\d*)[,;\s]+([+-]?\d+\.\d*)/;

  return {
    require: 'ngModel',
    link: function(_scope, _elm, _attrs, ctrl) {
      let type;
      ctrl.$parsers.push(parser);
      ctrl.$formatters.push(formatter);

      function parser(viewValue) {
        if (!type) {
          // keep track of coordinate type since it is lost
          // when returning undefined on invalid input
          type = ctrl.$modelValue && ctrl.$modelValue.type;
        }
        const m = viewValue.match(REGEXP);
        ctrl.$setValidity('coordinate', m || ctrl.$isEmpty(viewValue));
        if (m || ctrl.$isEmpty(viewValue)) {
          return new LatLng(type, {
            lat: m ? parseFloat(m[1]) : undefined,
            lng: m ? parseFloat(m[2]) : undefined
          });
        } else {
          return undefined;
        }
      }

      function formatter(coordinate) {
        return coordinate && coordinate.csv;
      }
    }
  };
}
