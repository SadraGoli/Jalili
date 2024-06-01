var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const rateLimit = require("express-rate-limit");

const winstonLogger = require('./logger');
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

// cors
/*app.use(cors())

// rate limit
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 100 requests per windowMs
});
//  apply to all requests
app.use(limiter);*/


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);




process.on('unhandledRejection', (reason, promise) => {
    winstonLogger.error('Unhandled Rejection:', { meta: { reason: { message: reason.message, name: reason.name, stack: reason.stack, promise } }, file: __filename, func: '' })
});
process.on('uncaughtException', (err, origin) => {
    winstonLogger.error('Unhandled Exception:' + String(err), { meta: { err, origin }, file: __filename, func: '' })
});
process.on('warning', (warning) => {
    winstonLogger.warn('warning ' + JSON.stringify([warning.name, warning.message]), { meta: { stack: warning.stack }, file: __filename, func: '' })
});

module.exports = app;
