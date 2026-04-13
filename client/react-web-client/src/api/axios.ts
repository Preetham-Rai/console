import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.APP_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})