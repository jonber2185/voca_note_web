import _axios from 'axios';
import { getDeviceId } from './getDevice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const axios = _axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshInstance = _axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      console.log("접근 권한이 없습니다. 비공개 페이지입니다.");
      if (!window.location.pathname.includes("/private-notice")) {
        window.location.replace("/private-notice");
      }
      return Promise.reject(error);
    }
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.msg
    ) {
      originalRequest._retry = true;

      try {
        await refreshInstance.post('/auth/refresh', {
          device_id: getDeviceId()
        });

        return axios(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;