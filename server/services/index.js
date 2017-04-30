
/**
 * @description : Initializes all the services, should be invoked only once at boot.
 * All the service handles are made accessible at app.locals.service.{{Service ID}}
 * @param app : Express app handle
 * @param done_cb : Completion callback
 */

module.exports= function(app, done_cb) {
    app.locals.service= {};
    require("./twitter")(app, done_cb);
};
