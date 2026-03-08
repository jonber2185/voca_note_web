import _axios from 'axios';
import { getDeviceId } from './getDevice';

const axios = _axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000',
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔹 인터셉터가 없는 전용 인스턴스로 요청!
        await refreshInstance.post('/auth/refresh', {
          device_id: getDeviceId()
        });

        return axios(originalRequest);
      } catch (e) {
        // 리프레시 자체가 실패하면 바로 거절 (무한루프 방지)
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
