import bcrypt from 'bcrypt'
import { signToken } from '../../utils/jwt'

export const loginUser = async (user: any, password: string) => {
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error('Invalid Credentials')
    }

    const token = signToken({
        userId: user._id,
        role: user.role
    })

    return {
        token: token
    }
}