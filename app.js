/*  NODE DEPENDENCIES
*/
var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var errorHandler    = require('errorhandler');
var passport        = require('passport');
var session         = require('express-session');

// To use flash middleware for displaying messages in templates
var flash           = require('connect-flash');

// Set up routes
var routes = require('./routes/index')(passport);
var user = require('./routes/user');
var shift = require('./routes/shift');
var templateShift = require('./routes/template-shift');
var shift = require('./routes/shift');
var swap = require('./routes/swap');
var schedule = require('./routes/schedule');
var organization = require('./routes/organization');
var record = require('./routes/record');

var security = require('./errors/security');

// Set up app
var app = express();
app.use(session({
    secret: 'WAH505ECRET',
    resave: true,
    saveUninitialized: true
}));

var db;
// Connecting to OpenShift if in openshift
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    dbURL = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
          process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
          process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
          process.env.OPENSHIFT_MONGODB_DB_PORT + '/zhift';
    db = require('mongoose').connect(dbURL, function() {
        console.log('Successfully connected to MongoDB at: \n', dbURL);
    });
}
else {
    var MONGOLAB_CONNECTION_STRING = 'mongodb://zhifty:6170@ds051110.mongolab.com:51110/zhift';
    if (app.get('env') === 'test') {
        MONGOLAB_CONNECTION_STRING = 'mongodb://zhifty:6170@ds051990.mongolab.com:51990/zhift-test';
    }
    mongoose.connect(MONGOLAB_CONNECTION_STRING);
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log('Database ready.');
    });
}

// Configure passport
app.use(passport.initialize());
app.use(passport.session());
var initPassport = require('./config/passport');
initPassport(passport);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tests')));
app.use(flash());

app.use('/', security.sanitize, routes);
app.use('/user', security.sanitize, security.isAuthenticated, user);
app.use('/shift', security.sanitize, security.isAuthenticated, shift);
app.use('/template', security.sanitize, security.isAuthenticated, templateShift);
app.use('/schedule', security.sanitize, security.isAuthenticated, schedule);
app.use('/org', security.sanitize, security.isAuthenticated, organization);
app.use('/swap', security.sanitize, security.isAuthenticated, swap);
app.use('/record', security.sanitize, security.isAuthenticated, record);

if (app.get('env') === 'test') {

    app.delete('/test', function(req, res) {
        require('./tests/clear-db')(function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).send({});
        });
    });

    app.post('/test', function(req, res) {
        require('./tests/seed-db')(function(err, data) {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).send(data);
        });
    });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 Not Found');
    err.status = 404;
    next(err);
});

// Error middleware 
app.use(function(err, req, res, next) {
    if (err.status === 400) {
        res.status(400).send(err.message);
    } 
    else if (err.status === 401) {
        res.status(401).send(err.message);
    } 
    else if (err.status === 403) {
        res.status(403).send(err.message);
    } 
    else if (err.status === 404) {
        res.status(404).send(err.message);
    } 
    else if (err.status === 500) {
        res.status(500).send(err.message);
    } 
    else {
        res.status(400).send(err.message);
    }
});

// development error handler
if (app.get('env') === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}
else {// production error handler
    app.use(function(err, req, res, next) {
        app.use(errorHandler());
    });
}

// Setting up port
var port = Number(process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.listen(port, process.env.OPENSHIFT_NODEJS_IP, function() {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});

module.exports = app;