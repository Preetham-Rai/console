import http from 'http'
import app from './app';
import dotenv from 'dotenv'
import { connectToDB } from './config/database';
import logger from './config/logger';


dotenv.config()
const server = http.createServer(app)

const PORT = process.env.PORT || 3000


connectToDB().then(() => {
    server.listen(PORT, () => {
        logger.info(`Server is Running in http://localhost:${PORT}`)
    })
}).catch((err) => {
    Promise.reject(err)
})

server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.log('Address is already in use')
        process.exit(1)
    }

    if (err.code === 'EACCES') {
        console.log('Permission denied for this port')
        process.exit(1)
    }

    console.log('Server Error', err)
    process.exit(1)
})

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception Error', err)
    process.exit(1)
})

process.on('SIGTERM', () => {
    console.log('Shutting Down the server....')
    server.close(() => {
        process.exit(0)
    })
})