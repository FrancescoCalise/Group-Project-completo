var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DoctorSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        index:true,
    },
    lastname: {
        type: String,
        required: true,
        index:true
    },
    user_id:{
        type:String,
        required:true,
        unique:true,
    },
    region:{
        type: String,
        index:true
    },
    city:{
        type: String,
        index:true
    },
    phone:{
        type: String,
    },
    address:{
        type: String,
    }
    });

module.exports = mongoose.model('Doctor', DoctorSchema);
