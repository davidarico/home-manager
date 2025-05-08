'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the auth token exists in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      
      if (authTokenCookie) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    // Delete the auth token cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    setIsAuthenticated(false);
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}