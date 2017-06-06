var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var SchemaTypes = mongoose.Schema.Types;
  
// set up a mongoose model
var UserSchema = new Schema({
    name: {
        type: String, 
        index:true,
        unique:true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    register_date:{ 
      type: Date, default: Date.now 
    },
    role: {
        type: String,
        enum: ['user','admin','doctor'],
        default: 'user'
    },
    email: {
        type: String,
        unique:true,
        required:true,
        index:true,
        validate: function(email) {
            return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
        }
  }


});
 
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
 
UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
UserSchema.path('email').validate = function(email) {
  return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
};

module.exports = mongoose.model('User', UserSchema);