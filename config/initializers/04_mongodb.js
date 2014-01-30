var mongoose = require('mongoose')

console.log("Initializing MongoDB");
module.exports = function () {
    console.log("connecting to : " + conf[this.env].database_connection)
    mongoose.connect(conf[this.env].database_connection)
}

