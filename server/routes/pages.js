/**
 * @description : Setup all page url routes
 * @param app : Express app handle
 */
module.exports= function (app) {
    app.get("/", function (req, res, next) {
        var hash_tag= app.locals.service.twitter.getSubscriptionHashTag();
        res.render("index", {hash_tag: hash_tag});
    });
};