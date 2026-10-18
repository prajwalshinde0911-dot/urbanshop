import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, signupRequest, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urbanshop_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('urbanshop_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem('urbanshop_token', data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (email, password, fullName) => {
    await signupRequest(email, password, fullName);
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('urbanshop_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);