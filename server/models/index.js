
const path= require("path");

const COLLECTIONS= {
    tweet   : true
};

module.exports= function(app, done_cb) {
    var mongoURI = app.locals.cfg.db.base_url +"es_" + app.locals.id;
    var connection= mongoose.createConnection(mongoURI);
    connection.on('connected', function(err) {
        var models= {};
        for (var collection in COLLECTIONS){
            models[key]= mongoose.model(collection, require("./"+collection));
        }
        app.locals.models= models;
        app.locals.mongo= connection;
        done_cb(err);
    });
};

HashTagFeed2