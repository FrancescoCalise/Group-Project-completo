var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExaminationSchema = new Schema({
    user_id:{
        type:String,
        require:true,
    },
    scan_id:{
        type:String,
        require:true,
        unique:true,
    },
    name_mole:{
        type:String,
        required:true,
        unique:true
    },
    doctor_id:{
        type:String,
        required:true,
    },  
    diagnosi:{
        type: String,
    },
    data:{
        type: Date,
        default: Date.now
    },
    completed:{
        type:Boolean,
        default:false
    }

    });

module.exports = mongoose.model('Examination', ExaminationSchema);