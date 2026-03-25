import { IUser } from "./user.interface";
import { UserModel } from "./user.schema";

export const createUserService = async (data: IUser) => {
    try {
        const response = await UserModel.create(data)
        console.log(response)
        return true
    } catch (error) {
        return false
    }
}