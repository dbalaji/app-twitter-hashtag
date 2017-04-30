/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.controller("AppCtrl", function($scope, HashTagFeed, socketFactory){

    $scope.input= {
        hash_tag    : ""
    };
    $scope.edit_mode= false;
    $scope.hash_tag = undefined;

    $scope.init= function () {
        var mySocket = socketFactory();
        HashTagFeed.get($scope.hash_tag)
             .then(function (res) {
                 $scope.records= res.data.records;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    $scope.editSubscription= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }
        $scope.input.hash_tag= $scope.hash_tag || "";
        //TODO: Show sweet alert
    };

    $scope.subscribe= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        HashTagFeed.subscribe($scope.input.hash_tag)
            .then(function (res) {
                $scope.hash_tag= res.data.record.hash_tag;
            })
            .catch(function () {
                
            });
    };

    $scope.loadUpdates= function (next) {

    };

});
