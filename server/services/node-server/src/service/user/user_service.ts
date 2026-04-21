import { User } from "../../types/user"
import { UserModel } from "./../../model/user_model"

export const createUserService = async (data: User) => {
    try {
        const response = await UserModel.create(data)
        console.log(response)
        return true
    } catch (error) {
        return false
    }
}