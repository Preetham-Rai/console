import jwt from 'jsonwebtoken'

export interface JwtPayload {
    userId: string;
    role: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'application-fallback-secret-key'

export const signToken = (payload: JwtPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m'
    })
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
}