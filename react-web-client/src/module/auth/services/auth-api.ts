import { http } from "@/api/http";
import { useMutation } from "@tanstack/react-query";
import type { UserRegistration } from "../types/user.types";
import { useNavigate } from "react-router";

type LoginResponse = {
    userId: string;
    status: boolean;
    accessToken: string;
    refreshToken: string;
    message: string;
};

export function useRegistration() {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: async (data: UserRegistration) => {
            const res = await http.post("/api/user", data);
            return res;
        },
        onSuccess: () => {
            navigate('/auth/login')
        },
        onError: (error) => {
            console.error(error)
        }
    });
}

export function useLogin() {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: async (data: {
            email: string;
            password: string
        }) => {
            const res = await http.post<LoginResponse>("/api/auth/login", data);
            return res;
        },
        onSuccess: (data: LoginResponse) => {
            console.log(data)
            localStorage.setItem('token', data.accessToken)
            navigate('/app/dashboard')
        },
        onError: (error) => {
            console.error(error)
        }
    });
}