/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.controller("AppCtrl", function($uibModal, $scope, HashTagFeed, socketFactory){

    $scope.input= {
        hash_tag    : ""
    };
    $scope.edit_mode= false;
    $scope.hash_tag = undefined;

    $scope.init= function () {
        if (!$scope.hash_tag){
            //show sweet alert
        }
        var mySocket = socketFactory();
        $scope.loadUpdates();
    };

    $scope.openSubscriptionDlg= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }
        $scope.input.hash_tag= $scope.hash_tag || "";
        $scope.subscription_dlg= $uibModal.open({
            templateUrl : 'subscription_dlg.html',
            scope       : $scope
        });
    };

    $scope.dismissSubscriptionDlg= function(){
        $scope.is_subscribing= false;
        $scope.subscription_dlg.dismiss();
    };


    $scope.subscribe= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }
        $scope.is_subscribing= true;

        HashTagFeed.subscribe($scope.input.hash_tag)
            .then(function (res) {
                $scope.hash_tag= res.data.record.hash_tag;
                $scope.dismissSubscriptionDlg();
                swal(
                    '',
                    'Successfully subscribed!',
                    'success'
                );
                $scope.records= [];
                $scope.loadUpdates();
            })
            .catch(function () {
                //show sweet alert of failure
            });
    };

    $scope.loadUpdates= function (next) {
        HashTagFeed.get($scope.hash_tag)
            .then(function (res) {
                $scope.records= res.data.records;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

});
