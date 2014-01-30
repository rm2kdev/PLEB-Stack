console.log("Initializing Config");
module.exports = conf = {
    application_name: "LEMP Framework",

    production: {    },
    staging: {    },
    test: {    },
    demo: {    },

    development: {
        database_connection:    "mongodb://localhost:27017/lempframework"
    }

}
