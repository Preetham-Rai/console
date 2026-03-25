import { Schema, model, CallbackWithoutResultAndOptionalError } from 'mongoose'
import bcrypt from 'bcrypt'
import { IUser, UserRole } from './user.interface'

const userSchema = new Schema<IUser>({
    userName: {
        type: String,
        required: true,
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        index: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        select: false
    },
    role: {
        type: String,
        default: UserRole.USER,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
})

export const UserModel = model<IUser>('User', userSchema)
