import { http } from "@/api/http";
import { useMutation } from "@tanstack/react-query";
import type { UserRegistration } from "../types/user.types";
import { useNavigate } from "react-router";

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
            const res = await http.post("/api/auth/login", data);
            return res;
        },
        onSuccess: (data) => {
            console.log(data)
            navigate('/dashboard')
        },
        onError: (error) => {
            console.error(error)
        }
    });
}