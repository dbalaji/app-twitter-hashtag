/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.controller("AppCtrl", function($timeout, $uibModal, $scope, HashTagFeed){

    $scope.input= {
        hash_tag    : ""
    };
    $scope.edit_mode= false;
    $scope.hash_tag = undefined;
    $scope.socket;
    $scope.is_loading= false;
    $scope.new_tweets= [];
    $scope.timeout_handle= undefined;

    $scope.init= function () {
        $scope.socket= HashTagFeed.startWatching();
        $scope.socket.forward('new', $scope);
        $scope.$on('socket:new', function (ev, new_tweets) {
            for (var i=0, n=new_tweets.length; i<n; i++){
                var t= new_tweets[i];
                $scope.new_tweets.push(t);
            }
            $scope.clearNewFlag();
        });
        if ($scope.hash_tag){
            $scope.load();
        }
    };

    $scope.clearNewFlag= function () {
        $timeout(function () {
            $scope.records.unshift($scope.new_tweets.pop());
            if ($scope.new_tweets.length >0){
                $scope.clearNewFlag();
            }
        }, 5000);
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
                $scope.load();
            })
            .catch(function (err) {
                alert(err);
                swal(
                    'Could not subscribe!',
                    'Please try again after some time!',
                    'error'
                );
                $scope.dismissSubscriptionDlg();
            });
    };

    $scope.load= function () {
        $scope.next_params= undefined;
        $scope.is_loading= true;
        HashTagFeed
            .get({hash_tag: $scope.hash_tag})
            .then(function (res) {
                $scope.records= res.data.records;
                $scope.next_params= res.data.meta.next;
                $scope.is_loading= false;
            })
            .catch(function (err) {
                $scope.is_loading= false;
                console.log(err);
                //TODO: need to show error message as transient dialog
            });
    };

    $scope.loadMore= function () {
        if ($scope.is_loading){
            return;
        }
        if (!$scope.next_params){
            return;
        }
        $scope.is_loading= true;
        HashTagFeed
            .get($scope.next_params)
            .then(function (res) {
                var records= res.data.records;
                records.forEach(function (record) {
                    $scope.records.push(record);
                });
                $scope.next_params= res.data.meta.next;
                $scope.is_loading= false;
            })
            .catch(function (err) {
                $scope.is_loading= false;
                console.log(err);
                //TODO: need to show error message as transient dialog
            });
    };

});
