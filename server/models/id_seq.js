
var mongoose= require('mongoose'),
    Schema  = mongoose.Schema;

module.exports= function(app){

    var schema= new Schema({
        uniq_id     : {
            type    : String,
            required: true,
            index   : {unique: true}
        },
        seq         : {
            type    : Number,
            default : 0,
            required: true
        }
    });
    
    schema.statics= {
        initSequence: function (uniq_id, callback) {
            var self= this;
            self.findOne({uniq_id: uniq_id}, function (err, doc) {
                if(err){
                    return callback(err);
                }
                if (doc){
                    return callback();
                }
                doc= new self({uniq_id: uniq_id});
                doc.save(callback);
            });
        },
        getNextSequence: function(uniq_id, callback){
            var self= this;
            self.findOneAndUpdate({uniq_id: uniq_id}, {$inc:{seq:1}}, {new:true}, function(err, record){
                if (err) {
                    return callback(err);
                }
                return callback(err, record.seq);
            });
            return 0;
        }
    };

    return schema;
};
