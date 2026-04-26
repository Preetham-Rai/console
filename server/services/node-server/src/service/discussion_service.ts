import { DiscussionModel } from "../model/discussions/discussion_model"
import { Discussion } from "../types/discussions/discussion"

export const writeDiscussion = async (payload: Discussion) => {
    try {
        const res = await DiscussionModel.create(payload)
        if (!res) {
            return {
                status: false,
                message: "Error while creating discussion"
            }
        }

        return {
            status: true,
            message: "Discussion created successfully"
        }
    } catch (error) {
        console.error(error)
        return {
            status: false,
            message: "Error while creating discussion"
        }
    }
}