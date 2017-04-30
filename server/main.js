
/**
 * @description: Entry point for the server.
 */

const http    = require("http");

require("./app")(function (err, app) {

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Setup Socket.io
     */
        //TODO: Complete this
    var io = require('socket.io')(server);
    io.on('connection', function(){
        console.log("connection active!");
    });

    /**
     * Listen on provided port, on all network interfaces.
     */

    var port= app.get("port");
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * @description: Event listener for HTTP server "error" event.
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
     * @description: Event listener for HTTP server "listening" event.
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

