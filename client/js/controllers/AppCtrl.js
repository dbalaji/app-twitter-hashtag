/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.controller("AppCtrl", function($scope, HashTagFeed, socketFactory){

    $scope.input= {
        hash_tag    : ""
    };

    $scope.hash_tag= undefined;
    $scope.init= function () {
        if ($scope.hash_tag) {
            $scope.input.hash_tag= $scope.hash_tag;
        }
        var mySocket = socketFactory();
        HashTagFeed.get($scope.hash_tag)
             .then(function (res) {
                 $scope.records= res.data.records;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    $scope.subscribe= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        HashTagFeed.subscribe($scope.input.hash_tag)
            .then(function () {
                
            })
            .catch(function () {
                
            });
    };

});
