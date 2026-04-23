import { Types } from "mongoose"
import { TokenModel } from "../../model/token_model"
import bcrypt from 'bcrypt'
import { UserModel } from "../../model/user_model"
import { signAccessToken } from "../../utils/jwt"

export const validateTokenAndReturn = async (refreshToken: string, userID: Types.ObjectId) => {
    try {
        const tokens = await TokenModel.find({})

        if (!tokens) {
            return {
                status: false,
                accessToken: null,
                message: "There is no tokens in this collection"
            }
        }

        let validToken = null

        for (const t of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, t.token)
            if (isMatch) {
                validToken = t
                break
            }
        }

        if (!validToken) {
            return {
                status: false,
                accessToken: null,
                message: "No valid token"
            }
        }

        if (validToken.expiresAt < new Date()) {
            return {
                status: true,
                refreshToken: null,
                message: "Valid Token"
            }
        }

        const user = await UserModel.findOne({ _id: userID })

        const payload = {
            userId: user ? user._id : null,
            role: user ? user.role : null
        }

        const accessToken = signAccessToken(payload)

        return {
            status: true,
            refreshToken: accessToken,
            message: "Token is generated"
        }

    } catch (error) {
        console.error(error)
    }
}