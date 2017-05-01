/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.controller("AppCtrl", function($uibModal, $scope, HashTagFeed){

    $scope.input= {
        hash_tag    : ""
    };
    $scope.edit_mode= false;
    $scope.hash_tag = undefined;
    $scope.socket;

    $scope.init= function () {
        if (!$scope.hash_tag){
            //show sweet alert
        }
        $scope.socket= HashTagFeed.startWatching();
        $scope.socket.forward('new', $scope);
        $scope.$on('socket:new', function (ev, new_tweets) {
            for (var i=new_tweets.length-1; i>=0; i--){
                var t= new_tweets[i]
                t.is_new= true;
                $scope.records.unshift(t);
            }
        });
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
            size        : "md",
            scope       : $scope
        });
    };

    $scope.dismissSubscriptionDlg= function(){
        $scope.is_subscribing= false;
        $scope.subscription_dlg.dismiss();
        $scope.is_subscribing= false;
    };

    $scope.subscribe= function (e) {
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }
        $scope.is_subscribing= true;

        HashTagFeed.subscribe($scope.input.hash_tag)
            .then(function (subscription) {
                $scope.hash_tag= subscription.hash_tag;
                $scope.dismissSubscriptionDlg();
                swal(
                    '',
                    'Successfully subscribed!',
                    'success'
                );
                $scope.records= [];
                $scope.loadUpdates();
            })
            .catch(function (err) {
                swal(
                    'Could not subscribe!',
                    'Please try again after some time!',
                    'error'
                );
                $scope.dismissSubscriptionDlg();
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
