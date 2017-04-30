
const path  = require('path');

const express   = require('express'),
    logger      = require('morgan'),
    async       = require('async'),
    ejs         = require('ejs');

const DEFAULT_PORT  = 3000;
const VIEWS_DIR     = "./views";
const STATIC_DIR    = "../client"

/**
 * @description : creates, initializes express app
 * @param done_cb : Completion callback, err, app are the arguments
 */
module.exports= function(done_cb) {

    var app = express();

    app.locals.cfg= require("../config/main.json");
    app.locals.pkg_info= require(path.join(__dirname, "../", "package.json"));

    app.set("port", DEFAULT_PORT);

    //TODO: Need to setup Logger

    // view engine setup
    app.set('views', VIEWS_DIR);
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');

    app.use(express.static(STATIC_DIR));

    // Initialize Routes for pages, api and errors
    require("./routes/pages")(app);
    require("./routes/api")(app);
    require("./routes/error")(app);

    var boot_steps= [
        "models",
        "services",
    ];

    var initialize= function (step, next) {
        require("./"+step)(app, next);
    };

    async.eachSeries(boot_steps, initialize, function (err) {
        done_cb(err, app);
    });
};

