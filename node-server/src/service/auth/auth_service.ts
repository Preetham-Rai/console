import bcrypt from 'bcrypt'
import { generateRefreshToken, signAccessToken, signToken } from '../../utils/jwt'
import { User } from '../../types/user';
import { UserModel } from '../../model/user_model';
import { TokenModel } from '../../model/token_model';
import { Types } from 'mongoose';

export const loginUser = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email })

    if (!user) {
        return {
            userId: null,
            status: false,
            token: null,
            refreshToken: null,
            message: "No User Found"
        }
    }

    const isValid = await bcrypt.compare(password, (user && user.password));
    if (!isValid) {
        throw new Error('Invalid Credentials')
    }

    const payload = {
        userId: user._id,
        role: user.role
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = generateRefreshToken()

    await saveRefreshToken(user._id, refreshToken)

    return {
        userId: user._id,
        status: true,
        token: accessToken,
        refreshToken,
        message: "Login Succesfull"
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

export const saveRefreshToken = async (userID: Types.ObjectId, token: string) => {
    try {
        const hashToken = await bcrypt.hash(token, 10)

        await TokenModel.create({
            userID,
            token: hashToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7days
        })
    } catch (error) {
        console.error(error)
        throw new Error("Error")
    }
}