import { useNavigate } from 'react-router'
import { axiosInstance } from './axios'

const navigate = useNavigate()

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            //redirect functionality to login page
            // logout()
            navigate('/auth/login')
        }

        return Promise.reject(error)
    }
)