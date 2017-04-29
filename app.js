var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.engine('.hbs', hbs({
    extname: '.hbs',
    defaultLayout: 'layout',
    partialsDir: path.join(__dirname, 'views/partials')
}));

var mongo_pw = process.env.MONGO_PW;
var url = 'mongodb://mongo:' + mongo_pw + '@localhost:27017/pokemon?authSource=admin';

var store = new MongoDBStore({
    uri: url,
    collection: 'sessions'
}, function(err){
    console.log(err)
});

app.use(session({
    secret: '3k3lkm6576lkmew098fknmf9876g3n',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
