import logger from "../../config/logger"
import { User } from "../../types/user"
import { UserModel } from "../../model/user_model"

export const registerUser = async (data: User) => {
    try {
        const userEmail = data && data.email

        const isUserExist = await UserModel.findOne({ email: userEmail })

        if (isUserExist) {
            const err = new Error("User email exists");
            (err as any).statusCode = 400;
            (err as any).code = "EMAIL_ALREADY_EXISTS"
            throw err
        }

        const created = await UserModel.create(data)
        if (created) {
            return {
                status: true,
                message: "User registered successfully"
            }
        }

        return {
            status: false,
            message: "Falied to create a user document"
        }
    } catch (error) {
        logger.error(error)
        throw error;
    }
}
