require('dotenv').config({ path: './.env' });

const winston = require('winston');
require('winston-daily-rotate-file');

const myTransport = new winston.transports.DailyRotateFile({
    filename: './logs/%DATE%-mergewall.log',
    datePattern: 'DD-MM-YYYY',
    frequency: '24h',
    maxFiles: '90d'
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD/MM/YYYY hh:mm:ss A' }),
        winston.format.json(),
        winston.format.printf(({ level, message, timestamp, error, value }) => {
            let res = `${timestamp} ${level.toUpperCase()} ${message}`
            if (error != undefined) res += ` ${JSON.stringify(error)}`
            if (value != undefined) res += ` ${JSON.stringify(value)}`
            return res
        })
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        myTransport
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp, error, value }) => {
                let res = `${timestamp} ${level.toUpperCase()} ${message}`
                if (error != undefined) res += ` ${JSON.stringify(error)}`
                if (value != undefined) res += ` ${JSON.stringify(value)}`
                return res
            })
        ),
    }));
}

logger.exceptions.handle(
    new winston.transports.File({ filename: './logs/exceptions.log' })
);
// const options = {
//     from: new Date() - (1 * 1000),
//     until: new Date(),
//     limit: 100,
//     start: 0,
//     order: 'desc',
//     fields: ['level', 'message']
// };


// logger.query(options, function (err, results) {
//     if (err) {
//         /* TODO: handle me */
//         throw err;
//     }

//     console.log(results);
// });

module.exports = logger;