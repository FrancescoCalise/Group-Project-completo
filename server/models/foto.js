var mongoose = require('mongoose');
var Schema = mongoose.Schema;

  
// set up a mongoose model
var fotoSchema = new Schema({
    img:{
        filename:String,
        data: Buffer, 
        contentType: String 
    }
  



});

 
module.exports = mongoose.model('photo', fotoSchema);