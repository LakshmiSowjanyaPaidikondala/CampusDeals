// JWT Authentication Hook for React Frontend
// Save this as: frontend/src/hooks/useAuth.jsx

import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api';

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: email,
          user_password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  // Function to make authenticated API calls
  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication required');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    apiCall,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage Examples:

// 1. Wrap your App with AuthProvider in main.jsx or App.jsx:
/*
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          // your routes
        </Routes>
      </Router>
    </AuthProvider>
  );
}
*/

// 2. Use in any component:
/*
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Show error
      setError(result.error);
    }
  };

  // Login form JSX...
}
*/

// 3. Protected Route Component:
/*
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
*/

// 4. Making authenticated API calls:
/*
function ProductManager() {
  const { apiCall } = useAuth();

  const addProduct = async (productData) => {
    try {
      const response = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product added:', result);
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };
}
*/
