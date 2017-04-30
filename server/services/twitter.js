
const twit  = require("twit");
const async = require("async");
const moment= require("moment");
const clone = require("clone");

const POLL_INTERVAL= 2*60*1000; //2 Minutes
const MAX_RESULTS_PER_REQUEST= 50;
const DEFAULTS  = {
    result_type : 'recent',
    lang        : 'en'
};

/**
 * @description : Initializes twitter service
 * @param app   : Express app handle
 * @param done_cb : Completion callback
 */

module.exports= function (app, done_cb) {
    var _twitter= new twit(app.locals.cfg.twitter),
        _hash_tag,
        _interval_handle,
        _self,
        _base_params= {},
        _ongoing= false;

    var doFetchAndSave= function (model) {
        if (!_hash_tag){
            return;
        }
        var curr_hash_tag   = _hash_tag,
            params          = clone(_base_params);

        var setupParams= function (next) {
            model.findOne({hash_tag: _hash_tag}, {id:1}, {sort:{id:-1}}, function (err, tweet) {
                if (err){
                    return next(err);
                }
                if (!tweet){
                    return next();
                }
                params.since_id= tweet.id;
                //params.since_id= tweet.id;
                //console.log(params);
                return next();
            });
        };

        var fetchNext= function (next) {
            console.log("fetching...", params.since_id);
            _twitter.get('search/tweets', params, function(err, data) {
                if (err){
                    console.log(err);
                    //TODO: need to handle errors
                    return;
                }
                if (curr_hash_tag !== _hash_tag){
                    //subscription changed, so ignore the results
                    return;
                }
                var records     = data.statuses,
                    meta_data   = data.search_metadata;
                var insertIntoCollection= function (record, next2) {
                    var doc= new model(record);
                    doc.hash_tag= curr_hash_tag;
                    doc.save(next2);
                };

                console.log("Received : "+records.length + " new results");
                async.eachSeries(records, insertIntoCollection, function (err) {
                    //TODO: Need to fetch next results
                    //fetchNext() based on max_id
                    next();
                });
            });
        };

        var steps=[
            setupParams,
            fetchNext
        ];
        async.series(steps, function (err) {
            //TODO: Need to handle error
        });
    };

    var startFetching= function () {
        _base_params= {
            q       : "#"+_hash_tag,
            count   : MAX_RESULTS_PER_REQUEST
        };
        for (var key in DEFAULTS){
            _base_params[key]= DEFAULTS[key];
        }
        if (_interval_handle){
            clearInterval(_interval_handle);
            _interval_handle= undefined;
        }
        doFetchAndSave(app.locals.models.tweet);
        _interval_handle= setInterval(function() {
            doFetchAndSave(app.locals.models.tweet);
        }, POLL_INTERVAL);
    };

    var stopFetching= function () {
        if (_interval_handle){
            clearInterval(_interval_handle);
            _interval_handle= undefined;
        }
    };

    _self= {
        subscribe: function (a_hash_tag) {
            var hash_tag= a_hash_tag;
            if (!hash_tag){
                return;
            }
            if (hash_tag && hash_tag[0] === "#"){
                hash_tag= hash_tag.substring(1).trim();
            }
            _hash_tag= hash_tag;
            startFetching();
        },
        unsubscribe: function () {
            _hash_tag= undefined;
            stopFetching();
        },
        getSubscriptionHashTag: function () {
            return _hash_tag;
        },
        getFeed: function (a_hash_tag, a_options, cb) {
            if (a_hash_tag !== _hash_tag){
                return cb({message:"Hash tag "+a_hash_tag+" not subscribed any more"});
            }
            var options= {
                limit   : 10,
                skip    : a_options.limit
            };
            app.locals.models.tweet.find({hash_tag: _hash_tag}, {}, options, function (err, records) {
                if (err){
                    return cb(err);
                }
                cb(err, {records:records});
            });
        }
    };

    var invokeDoneCB= function (err) {
        app.locals.service.twitter= _self;
        done_cb(err);
    };

    var SubscriptionModel= app.locals.models.subscription;
    SubscriptionModel.findOne({status:"active"}, function (err, record) {
        if (err){
            return invokeDoneCB(err);
        }
        record= {
            hash_tag: "Nodejs"
        };
        if (!record){
            console.log("No Active subscription found!");
            return invokeDoneCB();
        }
        _self.subscribe(record.hash_tag);
        return invokeDoneCB();
    });

};
