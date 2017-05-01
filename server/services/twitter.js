
const twit  = require("twit");
const async = require("async");
const moment= require("moment");
const clone = require("clone");
const url   = require('url');

const POLL_INTERVAL= 2*60*1000; //2 Minutes
const MAX_FETCH_PER_REQUEST= 50;
const DEFAULT_PARAMS    = {
    result_type         : 'recent',
    lang                : 'en',
    count               : MAX_FETCH_PER_REQUEST
};

const MAX_RESULTS_PER_PAGE =10;

const DEFAULT_SUBSCRIPTION_TAG= "nodejs";

/**
 * @description : Initializes twitter service
 * @param app   : Express app handle
 * @param done_cb : Completion callback
 */


module.exports= function (app, done_cb) {
    var _twitter,
        _feed,
        _socket,
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

            var invokeDoneCB= function (err, record) {
                if (!err){
                    _hash_tag= record.hash_tag;
                    _feed= new Feed(_hash_tag, _twitter, app);
                    _feed.start();
                    _feed.setSocket(_socket);
                }
                cb(err);
            };

            var SubscriptionModel= app.locals.models.subscription;
            SubscriptionModel.findOne({status:"active"}, function (err, record) {
                if (err){
                    return invokeDoneCB(err);
                }
                if (!record){
                    record= new SubscriptionModel({hash_tag: DEFAULT_SUBSCRIPTION_TAG});
                    record.save(function (err) {
                        invokeDoneCB(err, !err? record: undefined);
                    });
                    return;
                }
                return invokeDoneCB(undefined, record);
            });

        },
        setSocket: function (socket) {
            _socket= socket;
            if (_feed){
                _feed.setSocket(_socket);
            }
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
                    _feed.setSocket(_socket);
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
        getFeed: function (query, cb) {
            if (!query.hash_tag){
                return cb({message: "Hash tag, required param not sent!"});
            }
            if (query.hash_tag !== _hash_tag){
                return cb({message:"Hash tag "+query.hash_tag+" not subscribed any more"});
            }

            var options= {
                limit   : MAX_RESULTS_PER_PAGE,
                skip    : Number(query.skip||"0"),
                sort    : {id_str: -1}
            };
            var condition= {
                hash_tag: query.hash_tag
            };
            if (query.max_id){
                condition.id_str=  {$lt: query.max_id};
            }
            app.locals.models.tweet.find(condition, {}, options, function (err, records) {
                if (err){
                    return cb(err);
                }
                var meta= {};
                if (records.length === MAX_RESULTS_PER_PAGE){
                    meta.next= {
                        hash_tag: _hash_tag,
                        skip    : (options.skip||0)+records.length,
                        max_id  : records[records.length-1].id_str
                    };
                }

                cb(err, {records:records, meta: meta});
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
            self._log("Fetching... since_id :"+ params.since_id+", max_id:"+params.max_id);
            self._twit.get('search/tweets', params, function(err, data) {
                if (err){
                    return next(err);
                }
                var records     = data.statuses,
                    meta_data   = data.search_metadata,
                    tweets      = [];

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
                    doc.save(function (err) {
                        if (!err){
                            tweets.push(doc);
                        }
                        return next2();
                    });
                };

                self._log("Received : "+records.length + " new results");
                async.eachSeries(records, insertIntoCollection, function (err) {
                    if (err){
                        return next(err);
                    }
                    if (tweets.length >0){
                        self._emit("new", tweets);
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
                self._log(err);
            }
            if (self._abort){
                self._log("Aborted");
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
                self._log("Error while finding latest tweet");
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

Feed.prototype.setSocket= function (socket) {
    this._socket= socket;
};

Feed.prototype._emit= function (event, data) {
    this._log("New event::"+ event);
    if (this._socket){
        this._log("Emitting "+event);
        this._socket.emit(event, data);
    }
};

Feed.prototype._log= function (message) {
    console.log("#", this._hash_tag,">", message);
};