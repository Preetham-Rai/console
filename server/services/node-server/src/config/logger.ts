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

const { combine, printf, errors, json, timestamp, colorize, metadata } = winston.format;

const isProd = process.env.NODE_ENV === 'production'

const devFormat = printf(({ level, message, timestamp, stack, metadata }) => {
    return `${timestamp} ${level}: ${stack || message} 
            ${metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : ""}`
})

const logger = winston.createLogger({
    level: isProd ? 'info' : 'debug',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        metadata({ fillExcept: ["message", "level", "timestamp", "stack"] })),
    transports: [
        new winston.transports.Console({
            format: isProd ? combine(json()) : combine(
                colorize(),
                timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                devFormat
            )
        })
    ]
})

export default logger