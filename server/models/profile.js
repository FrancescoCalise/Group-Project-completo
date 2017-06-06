var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
  
// set up a mongoose model
var ProfileSchema = new Schema({
    user_id:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    register_date:{ 
      type: Date, default: Date.now 
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    bod:{
        type:Date,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    location:{
        type:String
    },
    weight:{
        type:String
    },
    height:{
        type:String
    },
    eye:{
        type:String
    },
    skin:{
        type:String
    },
    small_nevi:{
        type:String
    },
    large_nevi:{
        type:String
    },
    sunburns:{
        type:String
    },  
    risk:{
        type:Number
    }

});
 
module.exports = mongoose.model('Profile', ProfileSchema);
