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
    const storedUser = localStorage.getItem('userData');
    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
        } catch (error) {
          fetchUserProfile();
        }
      } else {
        fetchUserProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile with token:', token);
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('userData', JSON.stringify(data.user));
          console.log('User data updated in state and localStorage');
        }
      } else {
        console.error('Failed to fetch profile, status:', response.status);
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

      if (data.success) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
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

      if (data.success) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('cartItems');
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

  // Function to update user profile via API
  const updateUser = async (userId, updatedData) => {
    try {
      console.log('Updating user profile:', { userId, updatedData });
      
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      console.log('Update response status:', response.status);
      const responseData = await response.json();
      console.log('Update response data:', responseData);

      if (response.ok && responseData.success) {
        // Fetch updated user profile to get fresh data
        console.log('Update successful, fetching fresh profile data...');
        await fetchUserProfile();
        return { success: true, message: responseData.message || 'Profile updated successfully' };
      } else {
        return { success: false, error: responseData.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Function to update user data in context and localStorage
  const updateUserLocal = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    apiCall,
    updateUser,
    updateUserLocal,
    fetchUserProfile,
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
