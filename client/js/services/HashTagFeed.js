
angular.module('app')
.factory("HashTagFeed", function ($http, $q, socketFactory) {
    //TODO: need to maintain the state here
    return {
        startWatching: function () {
            return socketFactory();
        },
        subscribe: function (hash_tag) {
            var d= $q.defer();
            $http
                .patch("/api/subscription", {hash_tag: hash_tag})
                .then(function (res) {
                    d.resolve(res.data.record);
                })
                .catch(function (err) {
                    d.reject(err)
                });
            return d.promise;
        },
        unsubscribe: function () {
            return $http.delete("/api/subscription");
        },
        get: function (hash_tag) {
            return $http.get("/api/feed", {params:{hash_tag:hash_tag}});
        },

    };
});