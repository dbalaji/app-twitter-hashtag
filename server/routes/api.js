/**
 * @description : Setup all api routes
 * @param app : Express app handle
 */

module.exports= function (app) {

    /**
     * @description: Updates subscription #tag
     */
    app.patch("/api/subscription", function (req, res, next) {
        if (!req.query.hash_tag){
            //TODO: Need to send mandatory parameters empty error message
            return res.status(500);
        }
        app.locals.service.twitter.subscribe(req.query.hash_tag, function (err, subscription) {
            if (err){
                res.status(500);
                res.json({error: err});
            }
            else {
                res.json({record: subscription, meta: {}});
            }
        });

    });

    /**
     * @description: unsubscribe from #tag
     */
    app.delete("/api/subscription", function (req, res, next) {
        //TODO: need to implement this
        app.locals.service.twitter.unsubscribe(req.query.hash_tag);
        res.json({success: true});
    });

    app.get("/api/feed", function (req, res, next) {
        if (!req.query.hash_tag){
            //TODO: Need to send mandatory parameters empty error message
            return res.status(500);
        }

        var options= {
            max_id  : req.query.max_id,
            since_id: req.query.since_id
        };

        app.locals.service.twitter.getFeed(req.query.hash_tag, options, function (err, result) {
            if (err){
                res.status(500);
                res.json({error: err});
            }
            else {
                res.json({records: result.records, meta: result.meta});
            }
        });
    });
}