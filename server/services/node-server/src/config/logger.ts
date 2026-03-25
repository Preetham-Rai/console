import winston from "winston";

// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// }

const { combine, printf, errors, json, timestamp, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`
})

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true })),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                devFormat
            )
        })
    ]
})

export default logger