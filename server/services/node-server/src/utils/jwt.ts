import jwt from 'jsonwebtoken'
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'

export interface JwtPayload {
    userId: Types.ObjectId | null;
    role: string | null
}

const JWT_SECRET = process.env.JWT_SECRET || 'application-fallback-secret-key'
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'application-refresh-fallback-secret-key'

export const signAccessToken = (payload: JwtPayload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
}

export const generateRefreshToken = () => {
    return uuidv4()
}

export const signToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m'
    })
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
}