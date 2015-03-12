var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('./configs/db');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


mongoose.connect(db.url);
require('./configs/passport')(passport);// pass passport to configuration

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
    cookie: {path: '/', httpOnly: true, maxAge: 2628000000, secure: false},
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'millionaire', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    })
}));
// required for passport
app.use(passport.initialize());
app.use(passport.session());//persistent login session
app.use(flash());//use connect-flash for flash messages stored in session

//app.use('/', routes);
//app.use('/users', users);
require('./routes/index.js')(app, passport);//Load our routes and pass in our app  and fully configured passport


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

