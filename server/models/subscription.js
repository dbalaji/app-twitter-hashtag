
var mongoose= require('mongoose'),
    Schema  = mongoose.Schema;

module.exports= function (app) {

    var schema= new Schema({
        "hash_tag"      : {
            type        : String,
            index       : true
        },
        "status"        : {
            type        : String,
            default     : "active",
            enum        : ["active", "inactive"]
        },
        "created_at"    : {
            type        : Date
        },
        "modified_at"   : {
            type        : Date
        }
    });

    return schema;
};