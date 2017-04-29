
module.exports= function (app) {

    var schema= new Schema({
        "hash_tag"      : {
            type        : String,
            index       : true
        },
        "created_at"    : {
            type        : Date
            //"Sat Apr 29 02:30:06 +0000 2017"
        },
        "id"            : {
            type        : Number,
            index       : {unique: true}
            //858146342534877200
        },
        "id_str"        : {
            type        : String,
            index       : {unique: true}
            //"858146342534877184"
        },
        "text"          : {
            type        : String
            //"Enroll for \"To Do List\" Course for FREE\nStart coding projects in #JavaScript\nhttps://t.co/JYGFEU8Lv1\n\n#nodejs… https://t.co/dLYkIRzPyP"
        },
        "truncated"     : {
            type        : Boolean
            //true
        },
        "entities"      : {
            // "hashtags": [
            //     {
            //         "text": "JavaScript",
            //         "indices": [
            //             65,
            //             76
            //         ]
            //     },
            //     {
            //         "text": "nodejs",
            //         "indices": [
            //             102,
            //             109
            //         ]
            //     }
            // ],
            // "symbols": [],
            // "user_mentions": [],
            // "urls": [
            //     {
            //         "url": "https://t.co/JYGFEU8Lv1",
            //         "expanded_url": "https://goo.gl/uTwWVC",
            //         "display_url": "goo.gl/uTwWVC",
            //         "indices": [
            //             77,
            //             100
            //         ]
            //     },
            //     {
            //         "url": "https://t.co/dLYkIRzPyP",
            //         "expanded_url": "https://twitter.com/i/web/status/858146342534877184",
            //         "display_url": "twitter.com/i/web/status/8…",
            //         "indices": [
            //             111,
            //             134
            //         ]
            //     }
            // ]
        },
        "metadata"      : {
            // "iso_language_code": "en",
            // "result_type": "recent"
        },
        "source"        : {
            type        : String
            //"<a href=\"http://www.hootsuite.com\" rel=\"nofollow\">Hootsuite</a>"
        },
        // "in_reply_to_status_id": null,
        // "in_reply_to_status_id_str": null,
        // "in_reply_to_user_id": null,
        // "in_reply_to_user_id_str": null,
        // "in_reply_to_screen_name": null,
        "user"          : {
            // "id": 852485240186486800,
            // "id_str": "852485240186486784",
            // "name": "JavaScriptFun",
            // "screen_name": "javascriptfun",
            // "location": "internet",
            // "description": "In love with #JavaScript",
            // "url": null,
            // "entities": {
            //     "description": {
            //         "urls": []
            //     }
            // },
            // "protected": false,
            // "followers_count": 34,
            // "friends_count": 7,
            // "listed_count": 5,
            // "created_at": "Thu Apr 13 11:34:54 +0000 2017",
            // "favourites_count": 2,
            // "utc_offset": null,
            // "time_zone": null,
            // "geo_enabled": false,
            // "verified": false,
            // "statuses_count": 629,
            // "lang": "en-gb",
            // "contributors_enabled": false,
            // "is_translator": false,
            // "is_translation_enabled": false,
            // "profile_background_color": "000000",
            // "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
            // "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
            // "profile_background_tile": false,
            // "profile_image_url": "http://pbs.twimg.com/profile_images/852487368191819776/C3EBddOy_normal.jpg",
            // "profile_image_url_https": "https://pbs.twimg.com/profile_images/852487368191819776/C3EBddOy_normal.jpg",
            // "profile_link_color": "FAB81E",
            // "profile_sidebar_border_color": "000000",
            // "profile_sidebar_fill_color": "000000",
            // "profile_text_color": "000000",
            // "profile_use_background_image": false,
            // "has_extended_profile": false,
            // "default_profile": false,
            // "default_profile_image": false,
            // "following": false,
            // "follow_request_sent": false,
            // "notifications": false,
            // "translator_type": "none"
        },
       // "geo": null,
       // "coordinates": null,
       // "place": null,
       // "contributors": null,
        "is_quote_status"   : {
            type            : Boolean
            //false
        },
        "retweet_count"     : {
            type            : Number
            //0
        },
        "favorite_count"    : {
            type            : Number
            //0
        },
        "favorited"         : {
            type            : Boolean
            //false
        },
        "retweeted"         : {
            type            : Boolean
            //false
        },
        "possibly_sensitive": {
            type            : Boolean
            //false
        },
        "lang"              : {
            type            : String,
            enum            : ["en"]
        }
    });

    return schema;
};