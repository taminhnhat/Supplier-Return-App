require('dotenv').config({ path: './.env' });

const winston = require('winston');
require('winston-daily-rotate-file');
const log_directory = process.env.LOG_DIR || './logs'
// winston.addColors({
//     info: 'bold blue',
//     warn: 'italic yellow',
//     error: 'bold red',
//     debug: 'green',
// })

const myTransport = new winston.transports.DailyRotateFile({
    filename: `${log_directory}/%DATE%-mergewall.log`,
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
            // if (error != undefined) res += ` ${JSON.stringify(error)}`
            if (error != undefined) {
                if (error.message != undefined) res += ` ${JSON.stringify(error.message)}`
                if (error.errors != undefined) res += ` ${JSON.stringify(error.errors)}`
                if (error.stack != undefined) res += ` ${JSON.stringify(error.stack)}`
            }
            if (value != undefined) res += ` ${JSON.stringify(value)}`
            return res
        })
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({
            filename: `${log_directory}/error.log`, level: 'error'
        }),
        myTransport
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${ info.level }: ${ info.message } JSON.stringify({ ...rest })`
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            // winston.format.printf(({ level, message, timestamp, error, value }) => {
            //     let res = `${timestamp} ${level.toUpperCase()} ${message}`
            //     if (error != undefined) {
            //         // if (error.message != undefined) res += ` ${JSON.stringify(error.message)}`
            //         // if (error.errors != undefined) res += ` ${JSON.stringify(error.errors)}`
            //         // if (error.stack != undefined) res += ` ${JSON.stringify(error.stack)}`
            //         console.log(error)
            //     }
            //     if (value != undefined) res += ` ${JSON.stringify(value)}`
            //     return res
            // }),
            winston.format.colorize({ all: true }),
            winston.format.simple()
        ),
    }));
}

logger.exceptions.handle(
    new winston.transports.File({ filename: `${log_directory}/exceptions.log` })
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