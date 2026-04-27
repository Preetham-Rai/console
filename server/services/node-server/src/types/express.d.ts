import { AuthUser } from "./auth";

// global declaration for express types
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string | undefined
                email: string | undefined
                role: string | undefined
                permissions: string[] | undefined
                isActive: boolean | undefined
                isEmailVerified: boolean | undefined
                username: string | undefined
            }
        }
    }
}

export { };