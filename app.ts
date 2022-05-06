import UserTokenUtil from "./utils/UserTokenUtil";

const express = require('express');
const http = require('http');
import * as dotenv from 'dotenv';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import Db from './model/db';
import UserDto from "./dto/UserDto";
import UserModel from "./model/UserModel";

// - - - - - Environment variables - - - - - //
if (fs.existsSync('.env')) {
    console.log('Using .env file to supply config environment variables');
    dotenv.config();
} else {
    console.log('.env file not found, creating one with default values');

    fs.writeFileSync('.env', `
        PORT=3000
        OPEN_WEATHER_API_KEY=
        OPEN_WEATHER_LAT=
        OPEN_WEATHER_LON=
        MARIADB_HOST=localhost
        MARIADB_PORT=3306
        MARIADB_USER=root
        MARIADB_PASSWORD=example
        MARIADB_DATABASE=aquatracking
        ACCESS_TOKEN_SECRET=
        REFRESH_TOKEN_SECRET=
    `.replaceAll('    ', ''));

    console.log('Please complete .env file')

    process.exit(1);
}

if (process.env.OPEN_WEATHER_API_KEY === undefined || process.env.OPEN_WEATHER_API_KEY === '') {
    console.error('Environment variable OPEN_WEATHER_API_KEY is not defined.');
    process.exit(1);
} else if (process.env.OPEN_WEATHER_LAT === undefined || process.env.OPEN_WEATHER_LAT === '') {
    console.error('Environment variable OPEN_WEATHER_LAT is not defined.');
    process.exit(1);
} else if (process.env.OPEN_WEATHER_LON === undefined || process.env.OPEN_WEATHER_LON === '') {
    console.error('Environment variable OPEN_WEATHER_LON is not defined.');
    process.exit(1);
} else if (process.env.MARIADB_HOST === undefined || process.env.MARIADB_HOST === '') {
    console.error('Environment variable MARIADB_HOST is not defined.');
    process.exit(1);
} else if (process.env.MARIADB_PORT === undefined || process.env.MARIADB_PORT === '') {
    console.error('Environment variable MARIADB_PORT is not defined.');
    process.exit(1);
} else if (process.env.MARIADB_USER === undefined || process.env.MARIADB_USER === '') {
    console.error('Environment variable MARIADB_USER is not defined.');
    process.exit(1);
} else if (process.env.MARIADB_PASSWORD === undefined || process.env.MARIADB_PASSWORD === '') {
    console.error('Environment variable MARIADB_PASSWORD is not defined.');
    process.exit(1);
} else if (process.env.MARIADB_DATABASE === undefined || process.env.MARIADB_DATABASE === '') {
    console.error('Environment variable MARIADB_DATABASE is not defined.');
    process.exit(1);
} else if (process.env.ACCESS_TOKEN_SECRET === undefined || process.env.ACCESS_TOKEN_SECRET === '') {
    console.error('Environment variable ACCESS_TOKEN_SECRET is not defined.');
    process.exit(1);
} else if (process.env.REFRESH_TOKEN_SECRET === undefined || process.env.REFRESH_TOKEN_SECRET === '') {
    console.error('Environment variable REFRESH_TOKEN_SECRET is not defined.');
    process.exit(1);
}

// - - - - - Serveur Express - - - - - //
console.log('Starting server...');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// - - - - - Routes - - - - - //
app.all('*', function (req, res, next) {
    if (req.path === '/users/login' || req.path === '/users/register') {
        next();
    } else {
        jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                jwt.verify(req.cookies.refresh_token, process.env.REFRESH_TOKEN_SECRET, function (err, user) {
                    if (err) {
                        res.status(401).send();
                    } else {
                        UserModel.findByPk(user.id).then(function (user) {
                            if (user) {
                                res.cookie('access_token', UserTokenUtil.generateAccessToken(new UserDto(user)), {maxAge: 1000 * 60 * 30});
                                req.user = new UserDto(user);
                                next();
                            } else {
                                res.status(401).send();
                            }
                        }).catch(function (err) {
                            res.status(401).send();
                        })
                    }
                });
            } else {
                req.user = new UserDto(decoded);
                next();
            }
        });
    }
});
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/aquariums', require('./routes/aquariums'));

// - - - - - Database - - - - - //
console.log('Connecting to database...');
Db.init().catch(err => {
    console.error(err);
    process.exit(1);
});

// - - - - - Auto agents - - - - - //
console.log('Starting agents...');
/*OpenWeather.fetch().then(data => {
    console.log(data);
})*/

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
