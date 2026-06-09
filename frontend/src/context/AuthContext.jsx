// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsp_user')); } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email: email.trim().toLowerCase(), password });
    localStorage.setItem('bsp_token', data.data.token);
    localStorage.setItem('bsp_user',  JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    localStorage.setItem('bsp_token', data.data.token);
    localStorage.setItem('bsp_user',  JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bsp_token');
    localStorage.removeItem('bsp_user');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, isAdmin: user?.role === 'admin', isAuth: !!user }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
