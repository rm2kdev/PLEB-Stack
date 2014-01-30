var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
    username: { type: String, index: { unique: true }},
    password: String,
    email: String,
    name: String,
    active : Boolean
});

userSchema.statics.registerUser = function(username, password, email, name, cb) {
    var Model = this;

    bcrypt.hash(password, 8, function(err, hash) {
        var user = new Model({ username:username, password:hash, email:email, name:name, active:true});
        user.save(function (err) {
            cb(err, user);
        });
    });
};

userSchema.methods.validPassword = function(password, cb) {
    bcrypt.compare(password, this.hash, function(err, same) {
        cb(!err && same);
    });
};
//
//userSchema.methods.activate = function(cb) {
//    logger("err","About to activate user...")
//    this.active = true
//    this.save(function(err){
//        cb()
//    })
//};
//
//userSchema.methods.isActive = function(password, cb) {
//    logger("err","About to check if Valid Password...")
//    if(this.active){
//        cb(true)
//    }
//    else{
//        logger("err","Not active...")
//        cb(false)
//    }
//};
//
//userSchema.methods.update = function(phone, firstname, lastname, cb) {
//    this.phone = phone
//    this.name.first = firstname
//    this.name.last = lastname
//    this.save(function(err){
//        cb(err)
//    })
//};
//
//userSchema.methods.passwordreset = function(cb) {
//    var user = this;
//    user.passwordresetkey = guid();
//    user.save(function(err){
//        var data = {}
//        data.dns = conf[environment].dns
//        data.passwordresetkey = user.passwordresetkey
//        sendemail(user.email, "Employee Life Password Reset", data, "./htmltemplates/email/passwordreset.mustache", function(err){})
//        cb(err)
//    })
//};
//
//userSchema.methods.changepassword = function(newpassword, cb){
//    var user = this;
//    bcrypt.hash(newpassword, 8, function(err, hash) {
//        user.hash = hash
//        user.passwordresetkey = ""
//        user.save(function (err) {
//            if(err){
//                logger("err","Error :");
//                logger("err",err);
//                cb(err, false);
//            }else{
//                cb(err, true);
//            }
//        });
//    });
//}

module.exports = User = mongoose.connection.model('User', userSchema);
