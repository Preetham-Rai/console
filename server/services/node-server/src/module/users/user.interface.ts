export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator'
}

export interface IUser {
    userName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    isDeleted: boolean;
}