
const path  = require("path"),
    mongoose= require("mongoose");

mongoose.Promise = require('bluebird'); //set mongoose with promise library

const COLLECTIONS= {
    tweet       : true,
    subscription: true
};

module.exports= function(app, done_cb) {
    mongoose.set('debug', app.locals.cfg.debug);
    var mongoURI = app.locals.cfg.db.base_url +"hash_tag_feed";
    var connection= mongoose.createConnection(mongoURI);
    connection.on('connected', function(err) {
        var models= {};
        for (var collection in COLLECTIONS){
            models[collection]= connection.model(collection, require("./"+collection)());
        }
        app.locals.models= models;
        done_cb(err);
    });
};
