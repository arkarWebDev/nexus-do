'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  apiKey: null,
  setApiKey: () => {},
  clearApiKey: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setApiKeyState(localStorage.getItem('apiKey'));
    setIsLoading(false);
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem('apiKey', key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('apiKey');
    setApiKeyState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ apiKey, setApiKey, clearApiKey, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
