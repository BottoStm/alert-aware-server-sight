
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function loginUser(email: string, password: string) {
  const whmcsApiEndpoint = 'https://api.theservermonitor.com/whmcs';

  const payload = {
    email: email,
    password: password
  };

  const response = await fetch(whmcsApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://dashboard.theservermonitor.com'
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.success && data.data.result === 'success') {
    console.log('Login successful for user ID:', data.data.userid);
    return {
      id: data.data.userid.toString(),
      email: data.data.client.email,
      firstname: data.data.client.firstname,
      lastname: data.data.client.lastname
    };
  } else {
    console.error('Login failed:', data.message || 'Invalid credentials');
    throw new Error(data.message || 'Login failed');
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('An error occurred while contacting the server:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
