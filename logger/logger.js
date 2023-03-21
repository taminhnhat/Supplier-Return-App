require('dotenv').config({ path: './.env' });

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/combined.log' }),
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
            winston.format.splat(),
            winston.format.simple()
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