import { axiosInstance } from "./axios";
import type { AxiosRequestConfig } from "axios";

export const http = {
    get: async <T>(url: string, config?: AxiosRequestConfig) => {
        const response = await axiosInstance.get<T>(url, config);
        return response.data;
    },

    post: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => {
        const response = await axiosInstance.post<T>(url, body, config);
        return response.data;
    },

    put: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => {
        const response = await axiosInstance.put<T>(url, body, config);
        return response.data;
    },

    delete: async<T>(url: string, config?: AxiosRequestConfig) => {
        const response = await axiosInstance.delete<T>(url, config);
        return response.data;
    }
}