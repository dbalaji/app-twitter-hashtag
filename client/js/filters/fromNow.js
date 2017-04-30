/**
 * @description: Angular filter for showing date in relative terms
 */
angular.module('app')
    .filter('fromNow', function() {
        return function(dt) {
            return dt ? moment(dt).fromNow() : "";
        }
    });
