import axios from 'axios';

const URL = import.meta.env.VITE_REACT_APP_SOCKET_URL;

export const axiosInstance = axios.create ({
    baseURL: `${URL}/api`,
    withCredentials: true,
})      