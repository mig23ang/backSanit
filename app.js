/**
* Aplication Modules
*
*
**/

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const cors = require('cors');

/**
* Aplication Objects
*
**/

var mongoose = require('mongoose');
var nunjucks = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');
var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");

/**
* Application properties
*/

const dbConn = require ("./config/database.js");
mongoose.connect(dbConn.strCon,{  
    auto_reconnect: true,
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useCreateIndex: true

}, function(err, db) {
    if (err) {
        console.log("connection " + err.message + "");
    } else {
        console.log('Successful DB connection');
    }
});

/**
* main object configuration
**/
let app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: false })
);

const portListener = process.env.PORT || 5000;
app.listen(portListener, () => {
    console.log('Testing of portListener: ' + portListener)
});

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit:500000}));

app.use(cors());
app.options('', cors());
//setting location of node modules
app.use(express.static(path.join(__dirname, 'node_modules')));
// set the default path of fron resources
app.use(express.static(path.join(__dirname, '../FrontEnd')));
app.use(express.static(path.join(__dirname, 'uploads')));
//
//app.use(require('./middleware/sessions.js'));

const jwtFilter = require("./security/jwtfilter");
app.use(jwtFilter());

const errorHandler = require("./security/errorhandler");
app.use(errorHandler);

/**
* Defining Routes
*
**/
const controller = require ("./router/api");


/**
* Usage of Routing
**/
app.use("/", controller);