var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require ('express-session');

var idoneRouter = require('./routes/idone');
// var afooRouter = require('./routes/afoo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'ssshhhhhhh_secret'}));
app.use(express.static(path.join(__dirname, '../wwwroot')));

// parse submitted content
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/').get(function (req, res) {
  res.redirect('/id1/');
})
app.use('/id1/', idoneRouter);
// app.use('/afoo/', afooRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
