/**
 * Created by balaji on 29/4/17.
 */

angular.module('app')
.factory("HashTagFeed", function ($http, $q) {
    //TODO: need to maintain the state here
    return {
        subscribe: function (hash_tag) {
            return $http.patch("/api/subscription", {hash_tag: hash_tag});
        },
        unsubscribe: function () {
            return $http.delete("/api/subscription");
        },
        get: function (hash_tag) {
            return $http.get("/api/feed", {params:{hash_tag:hash_tag}});
        },

    };
});