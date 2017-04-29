
var modules=[
    //'ngSanitize',
    'ui.bootstrap',
    //"sticky",
    //'ng-sweet-alert'
];

//Initialize main app here.
angular.module('app', modules);


angular.module('app')
.config(['$httpProvider','$compileProvider', '$locationProvider', '$provide',
         function($httpProvider,$compileProvider, $locationProvider, $provide) {
             /**
              * @description: Adds a random no to each api request, to avoid caching of result set.
              */

             $httpProvider.interceptors.push(function($q) {
                 return {
                     'request': function(config) {
                         if (config.url.indexOf("/api") === 0) {
                             if (!config.params) {
                                 config.params= {};
                             }
                             config.params._rand= Math.random();
                         }
                         return config || $q.when(config);
                     },
                     'responseError': function(rejection) {
                         return $q.reject(rejection);
                     },
                     'response': function(response) {
                         return response;
                     }
                 };
             });
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|blob|data):/);
    $locationProvider.html5Mode(false).hashPrefix('!');
}]);
