var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScanSchema = new Schema({
    user_id:{
        type:String,
        require:true,
        index:true
    },
    mole_id:{
        type:String,
        require:true,
        unique:true,
        index:true
    },
    doctor_id:{
        type:String,
        required:true,
        index:true
    },
    name_mole:{
        type:String,
        required:true,
        unique:true
    },
    filename:{
        type:String,
        unique:true,
        index:true
    },
    photo_uri:{
        type:String,
        unique:true,
        index:true
    },
    date:{    
        type:Date,
        index:true
    },
    asymmetry:{
        type:Number
    },
    border:{
        type:Number
    },
    color:{
        type:Number
    },
    diamater:{
        type:Number
    },
   type:{
       type:String
   },
   desc:{
       type:String
   },
   body_part:{
       type:String
   },
   itch:{
       type:Boolean
   },
   fire:{
       type:Boolean
   },
   puffy:{
       type:Boolean
   },
   pain:{
       type:Boolean
   },
   visitated:{
       type:Boolean,
       default:false
   }

});


module.exports = mongoose.model('Scan', ScanSchema);