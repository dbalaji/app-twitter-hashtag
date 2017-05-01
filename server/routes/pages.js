/**
 * @description : Setup all page url routes
 * @param app : Express app handle
 */
module.exports= function (app) {
    app.get("/", function (req, res, next) {
        var exported= {
            hash_tag: app.locals.service.twitter.getSubscriptionHashTag(),
            pkg_info: app.locals.pkg_info
        };
        res.render("index", exported);
    });
};