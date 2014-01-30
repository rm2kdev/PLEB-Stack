console.log("Initializing Modals");
var fs = require('fs');

module.exports = function() {

    var models_path = __dirname + '/../../app/models/'
    var model_files = fs.readdirSync(models_path)
    model_files.forEach(function(file){
        console.log("Loading Model - " + file)
        require(models_path+'/'+file)
    })
}

