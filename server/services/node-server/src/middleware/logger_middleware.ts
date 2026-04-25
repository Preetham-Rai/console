import { v4 as uuid } from 'uuid'
import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuid();
    const start = Date.now();

    (req as any).requestId = requestId;

    logger.info("Incoming request", {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });

    res.on('finish', () => {
        const duration = Date.now() - start

        logger.info("Request completed", {
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration,
        });
    })
}