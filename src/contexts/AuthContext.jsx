import axios from '../lib/axios';
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getDeviceId, getOrSetDeviceId } from '../lib/getDevice';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    user_id: null,
    name: null,
    device_id: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await axios.get('/user/me');
      const current_device_id = getDeviceId();

      // 🔹 유저 정보가 있으면 업데이트 (이동 로직 삭제!)
      setUser({
        user_id: response.data.user_id,
        name: response.data.username,
        device_id: current_device_id,
      });
    } catch (error) {
      setUser({
        user_id: null,
        name: null,
        device_id: null
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const device_id = getOrSetDeviceId();
    const response = await axios.post('/auth/login', {
      ...credentials,
      device_id: device_id,
    });
    setUser({
      user_id: response.data.user_id,
      name: response.data.username,
      device_id: device_id,
    });
  };

  const logout = async () => {
    const device_id = getOrSetDeviceId();
    await axios.post('/auth/logout', { device_id: device_id, });
    setUser({
      user_id: null,
      name: null,
      device_id: null,
    });
  };

  const updateName = async (newName) => {
    setUser(prev => ({
      ...prev,
      name: newName
    }));
  };

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateName, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider 내부에서 사용해야 합니다.");
  return context;
}