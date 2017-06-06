// server.js

//load enviroment vairiables
require('dotenv').config();

    // import moduli node ========================
var express  = require('express');
var multer	=	require('multer');
var app      = express();                          // create our app w/ express
var mongoose = require('mongoose');                 // mongoose for mongodb
var morgan =   require('morgan');                   // log requests to the console (express4)
var bodyParser = require('body-parser');            // pull information from HTML POST (express4)
var methodOverride = require('method-override');    // simulate DELETE and PUT (express4)
var port =       process.env.PORT; 
var passport= require('passport');
var logger = require("./server/config/logger");
var fs = require('fs');


// configuration =================

    // mongoose.connect(process.env.DB_URI);           // connect to mongoDB database on .evi file. USA QUESTA RIGA PER CONNETTERTI AL DATABASE SU M LAB

    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/neoscan');

    var con = mongoose.connection;
        con.on('error', function (err){
            console.log('errore di connessione', err);
        });

    con.once('open', function (){
        console.log('connessione al database neoscan riuscita!');
        });

    app.use(passport.initialize());
    app.use(express.static(__dirname + '/client/www'));             // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

// routes ======================================================================
    app.use(require('./server/routes.js'));


    // listen (start app with node server.js) ======================================
    app.listen(port,()=>{
        console.log('server on su http://lochalhost:' + port);
    })