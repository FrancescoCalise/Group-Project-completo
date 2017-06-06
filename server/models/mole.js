var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MoleSchema = new Schema({
    user_id:{
        type:String,
        required: true,
        index:true
    },
    name: {
        type: String,
        required: true,
        unique:true,
        index:true
    },
    x:{
        type:Number,
        required: true,
    },
    y:{
        type:Number,
        required: true,
    },
    type:{
        type:String,
        index:true,
    },
    body_part:{
        type:String,
        required: true,
    },
     img:{
        filename:String,
        path: String, 
        contentType: String 
    },
    date:{    
        type:Date,
        default:Date.now,
        index:true
    },
    

    });

module.exports = mongoose.model('Mole', MoleSchema);