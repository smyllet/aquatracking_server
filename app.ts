const express = require('express');
const path = require('path');
const http = require('http');
import * as dotenv from 'dotenv';
import fs from 'fs';

import OpenWeather from "./agents/OpenWeather";

// - - - - - Environment variables - - - - - //
if(fs.existsSync('.env')) {
    console.log('Using .env file to supply config environment variables');
    dotenv.config();
} else {
    console.log('.env file not found, creating one with default values');

    fs.writeFileSync('.env', `
        PORT=3000
        OPEN_WEATHER_API_KEY=
        OPEN_WEATHER_LAT=
        OPEN_WEATHER_LON=
    `.replaceAll('    ', ''));

    console.log('Please complete .env file')

    process.exit(1);
}

if(process.env.OPEN_WEATHER_API_KEY === undefined || process.env.OPEN_WEATHER_API_KEY === '') {
    console.error('Environment variable OPEN_WEATHER_API_KEY is not defined.');
    process.exit(1);
} else if(process.env.OPEN_WEATHER_LAT === undefined || process.env.OPEN_WEATHER_LAT === '') {
    console.error('Environment variable OPEN_WEATHER_LAT is not defined.');
    process.exit(1);
} else if(process.env.OPEN_WEATHER_LON === undefined || process.env.OPEN_WEATHER_LON === '') {
    console.error('Environment variable OPEN_WEATHER_LON is not defined.');
    process.exit(1);
}

// - - - - - Serveur Express - - - - - //
console.log('Starting server...');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// - - - - - Routes - - - - - //
app.use('/users', require('./routes/users'));

// - - - - - Auto agents - - - - - //
console.log('Starting agents...');
OpenWeather.fetch().then(data => {
    console.log(data);
})

// - - - - - Functions - - - - - //
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
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
function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}