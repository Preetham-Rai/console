import bcrypt from 'bcrypt'
import { signToken } from '../../utils/jwt'
import { User } from '../../types/user';
import { UserModel } from '../../model/user_model';

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

export const registerUser = async (payload: User) => {
    try {
        const isExistingUser = await UserModel.find({ email: payload.email })

        if (isExistingUser) {
            return {
                status: false,
                message: "Email is already in use"
            }
        }
        const user = new UserModel(payload)
        await user.save()

        return {
            status: true,
            message: "User registered Successful"
        }

    } catch (error) {
        return {
            status: false,
            message: error
        }
    }
}