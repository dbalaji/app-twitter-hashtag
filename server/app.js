
var path = require('path'),
    http= require("http");

var express     = require('express'),
    logger      = require('morgan'),
    async       = require('async'),
    ejs         = require('ejs'),
    mongoose    = require('mongoose');

mongoose.Promise = require('bluebird'); //set mongoose with promise library

const DEFAULT_PORT  = 3000;
const VIEWS_DIR     = "./views";
const STATIC_DIR    = "../client"

var doInit= function(app, done_cb) {

    var pkg_json= require(path.join(__dirname, "../", "package.json"));

    app.locals.cfg= require("../config/main.json");
    mongoose.set('debug', app.locals.cfg.debug);

    app.set("port", DEFAULT_PORT);

    // view engine setup
    app.set('views', VIEWS_DIR);
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');

    app.use(express.static(STATIC_DIR));

    app.get("/", function (req, res, next) {
        console.log("get called");
        res.render("index");
    });
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        console.log("In error handler", err);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });


    done_cb();

};


var app = express();
doInit(app, function () {

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    var port= DEFAULT_PORT;
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log('Listening on ' + bind);
    }


    /**
     * @description : Graceful termination of server process
     */
    var is_terminating  = false,
        is_exiting      = false;

    process.on('SIGINT', function () {
        console.log("Catched SIGNINT, About to Terminate...");
        if (is_terminating){
            if (!is_exiting){
                console.log("About to HARD EXIT in 2ms");
                setTimeout(process.exit, 2);
                is_exiting= true;
            }
            return;
        }
        is_terminating= true;
        var exitProcess= function () {
            setTimeout(process.exit, 1);
        };
        if (server){
            server.close(exitProcess);
        }
    });
} );

