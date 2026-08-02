import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const signOut = useCallback(() => {
    setToken('');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        setUser(await api.getMe());
      } catch {
        setToken('');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const signIn = useCallback(async (username, password) => {
    const { token, user: signedIn } = await api.login({ username, password });
    setToken(token);
    setUser(signedIn);
    return signedIn;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn,
      signOut,
      isAdmin: user?.role === 'admin',
    }),
    [user, ready, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
