const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );

    // Request headers you wish to allow
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With,content-type, application/json, Authorization',
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Accept-Language', '*');

    // Pass to next layer of middleware

    next();
});

app.options('/api', cors());
app.use(cors());

// API routes - versioned!
const API_VERSIONS = ['v1'];
API_VERSIONS.map((version) => {
    app.use(`/api/${version}/`, require(`./routes/api/${version}`));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    const error = {
        message: err.message,
        error: {},
    };
    // development error handler

    if (app.get('env') === 'development') {
        error.error = err;
    }

    res.json(error);
});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

(async function () {
    try {
        await require('./config/db')();
        console.log('Connected to MongoDB...');
        app.listen(port, (err) => {
            if (err) onError(err);
            onListening();
        });
    } catch (e) {
        console.log('Error:', e);
    }
})();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    console.log(' * * * STARTING * * * \n\n');
    console.log(`Listening on port ${port}`);
}
