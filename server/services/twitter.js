
const twit  = require("twit");
const async = require("async");
const moment= require("moment");
const clone = require("clone");
const url   = require('url');

const POLL_INTERVAL= 2*60*1000; //2 Minutes
const MAX_RESULTS_PER_REQUEST= 50;
const DEFAULT_PARAMS    = {
    result_type         : 'recent',
    lang                : 'en',
    count               : MAX_RESULTS_PER_REQUEST
};

/**
 * @description : Initializes twitter service
 * @param app   : Express app handle
 * @param done_cb : Completion callback
 */


module.exports= function (app, done_cb) {
    var _twitter,
        _feed,
        _hash_tag,
        _self;

    var destroyFeed= function () {
        var curr_feed= _feed;
        if (curr_feed){
            curr_feed.stop();
        }
        //TODO: Need to decide anything else need to be done here
        // May be delete all tweets from db corresponding to this hashtag
        _feed= undefined;
    };

    _self= {
        init    : function (cb) {
            _twitter= new twit(app.locals.cfg.twitter);

            var invokeDoneCB= function (err) {
                cb(err);
            };

            var SubscriptionModel= app.locals.models.subscription;
            SubscriptionModel.findOne({status:"active"}, function (err, record) {
                if (err){
                    return invokeDoneCB(err);
                }
                if (!record){
                    console.log("No Active subscription found!");
                    return invokeDoneCB();
                }
                _hash_tag= record.hash_tag;
                _feed= new Feed(_hash_tag, _twitter, app);
                _feed.start();
                return invokeDoneCB();
            });

        },
        subscribe: function (a_hash_tag, cb) {
            var hash_tag= a_hash_tag;

            var invokeDoneCB= function (err, doc) {
                setTimeout(function () {
                    cb(err, doc);
                }, 1)
            };
            if (!hash_tag){
                return invokeDoneCB({message:"HashTag Empty"});
            }
            if (hash_tag && hash_tag[0] === "#"){
                hash_tag= hash_tag.substring(1).trim();
            }
            if (!hash_tag){
                return invokeDoneCB({message:"HashTag Empty"});
            }
            if (hash_tag.toLowerCase() === (_hash_tag||"").toLowerCase()) {
                return invokeDoneCB({message: "Hash Tag Same as earlier!"});
            }
            var SubscriptionModel= app.locals.models.subscription;
            SubscriptionModel.findOne({}, function (err, record) {
                if (err){
                    return invokeDoneCB(err);
                }
                if (!record){
                    record= new SubscriptionModel({hash_tag: hash_tag, created_at: new Date(), modified_at: new Date()});
                }
                record.hash_tag= hash_tag;
                record.modified_at= new Date();
                record.save(function (err) {
                    if (err){
                        return invokeDoneCB(err)
                    }
                    _hash_tag= record.hash_tag;
                    destroyFeed();
                    _feed= new Feed(_hash_tag, _twitter, app);
                    _feed.start();
                    return invokeDoneCB(err, record);
                });
            });
        },
        unsubscribe: function () {
            var SubscriptionModel= app.locals.models.subscription;
            SubscriptionModel.findOneAndUpdate({}, {$set:{status:"inactive"}}, function (err, record) {
                if (err){
                    return;
                }
                destroyFeed();
                _hash_tag= undefined;
            });
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
                skip    : a_options.limit,
                sort    : {created_at: -1}
            };
            app.locals.models.tweet.find({hash_tag: _hash_tag}, {}, options, function (err, records) {
                if (err){
                    return cb(err);
                }
                cb(err, {records:records});
            });
        }
    };

    _self.init(function (err) {
        app.locals.service.twitter= _self;
        return done_cb(err);
    });
};


/**
 * @description : This fetches #tag results periodically and saves into db
 * @param hash_tag
 * @param twit_handle
 * @param model
 * @constructor
 */
var Feed= function (hash_tag, twit_handle, app) {
    this._model= app.locals.models.tweet;
    this._id_seq_model= app.locals.models.id_seq;
    this._twit= twit_handle;
    this._hash_tag= hash_tag;
    this._timeout_handle= undefined;
    this._base_params= clone(DEFAULT_PARAMS);
    this._base_params.q= "#"+hash_tag;
    this._abort= false;
    this._ongoing= false;
};

Feed.prototype.start= function () {
    var self= this;

    if (!this._hash_tag){
        return;
    }
    if (this._ongoing){ //Start already called
        return;
    }

    var doFetchAndSave= function () {
        var params= clone(self._base_params);
        var batch_id;

        var getBatchId= function (next) {
            delete params.max_id;
            self._id_seq_model.getNextSequence(self._hash_tag, function (err, next_seq_id) {
                if (err){
                    return next(err);
                }
                batch_id= next_seq_id;
                return next();
            });
        };

        var fetch= function (next) {
            console.log("Fetching...", params.since_id);
            self._twit.get('search/tweets', params, function(err, data) {
                if (err){
                    return next(err);
                }
                var records     = data.statuses,
                    meta_data   = data.search_metadata;

                var insertIntoCollection= function (record, next2) {
                    if (self._abort){
                        return next2("Aborted");
                    }
                    if (params.max_id && (record.id_str === params.max_id)){
                        //skip max id record, which is already inserted into db
                        return next2();
                    }
                    var doc= new self._model(record);
                    doc.hash_tag= self._hash_tag;
                    doc.batch_id= batch_id;
                    doc.save(next2);
                };

                console.log("Received : "+records.length + " new results");
                async.eachSeries(records, insertIntoCollection, function (err) {
                    if (err){
                        return next(err);
                    }
                    if (!params.since_id){
                        //If this is first time, don't get older tweets
                        var refresh_query= url.parse(meta_data.refresh_url, true).query;
                        self._base_params.since_id= refresh_query.since_id;
                        return next();
                    }
                    if (!meta_data.next_results){
                        var refresh_query= url.parse(meta_data.refresh_url, true).query;
                        self._base_params.since_id= refresh_query.since_id;
                        return next();
                    }
                    var next_results_query= url.parse(meta_data.next_results, true).query;
                    params.max_id= next_results_query.max_id;
                    fetch(next);
                });
            });
        };

        var steps=[
            getBatchId,
            fetch
        ];
        async.series(steps, function (err) {
            if (err){
                console.log(err);
            }
            if (self._abort){
                console.log("Aborted");
                return;
            }
            self._timeout_handle= setTimeout(doFetchAndSave, POLL_INTERVAL);
        });
    };

    self._id_seq_model.initSequence(self._hash_tag, function (err) {
        if (err){
            console.log("Error while initializing batch id seq for ", self._hash_tag);
            return;
        }
        self._model.findOne({hash_tag: self._hash_tag}, {id_str:1}, {sort:{id_str:-1}}, function (err, tweet) {
            if (err){
                console.log("Error while finding latest tweet in the subscribed hash tag");
                return;
            }
            if (tweet){
                self._base_params.since_id= tweet.id_str;
            }
            doFetchAndSave();
        });
    });
};

Feed.prototype.stop= function () {
    this._abort= true;
    if (this._timeout_handle) {
        clearTimeout(this._timeout_handle);
        this._timeout_handle= undefined;
    }
};
