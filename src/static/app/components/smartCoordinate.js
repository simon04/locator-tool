export default function directive() {
  const REGEXP = /([+-]?\d+\.\d*)[,;\s]+([+-]?\d+\.\d*)/;

  return {
    require: 'ngModel',
    link: function(scope, _elm, _attrs, ctrl) {
      ctrl.$parsers.push(parser);
      ctrl.$formatters.push(formatter);
      scope.$watch(() => ctrl.$modelValue, render, true); // deep watch

      function parser(viewValue) {
        const m = viewValue.match(REGEXP);
        ctrl.$setValidity('coordinate', m);
        if (m) {
          ctrl.$modelValue.setLatLng({lat: m[1], lng: m[2]});
        } else {
          ctrl.$modelValue.setLatLng({lat: undefined, lng: undefined});
        }
        render();
        return ctrl.$modelValue;
      }

      function formatter(coordinate) {
        return coordinate && coordinate.csv;
      }

      function render() {
        ctrl.$setViewValue(formatter(ctrl.$modelValue));
        ctrl.$render();
      }
    }
  };
}
