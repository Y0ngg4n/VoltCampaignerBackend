const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
const db = require('./src/db/db')
const dotenv = require('dotenv');

// get config vars
dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/poster', require('./routes/poster'));
app.use('/poster-tags', require('./routes/poster_tags'));
app.use('/flyer', require('./routes/flyer'));
app.use('/', require('./routes/auth'));

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

var maxRetryCount = 15;

async function connect(){
    const client = await db.getConnection().catch((err) => console.log(err.stack))
    await db.retryTxn(0, maxRetryCount, client, db.initTable, (response) => {
        console.log("Created Table: " + response)
    })
    console.log("After initTable");
    return client;
}
const client = connect()

module.exports = app;
