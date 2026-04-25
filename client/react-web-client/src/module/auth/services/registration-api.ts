import { http } from "@/api/http";
import { useMutation } from "@tanstack/react-query";
import type { UserRegistration } from "../types/user.types";

export function useRegistration() {
    return useMutation({
        mutationFn: async (data: UserRegistration) => {
            const res = await http.post("/api/user", data);
            return res;
        }
    });
}