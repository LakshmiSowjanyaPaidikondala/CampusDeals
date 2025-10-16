# Refresh Token Implementation Guide

## 🔐 **Overview**
CampusDeals now implements a secure JWT refresh token system with short-lived access tokens and long-lived refresh tokens for enhanced security.

## 🎯 **Key Features**
- **Dual Token System**: Access tokens (15 minutes) + Refresh tokens (7 days)
- **Database Storage**: Refresh tokens stored securely in SQLite database
- **Automatic Rotation**: New refresh token issued on each refresh
- **Token Revocation**: Secure logout revokes all tokens
- **Cleanup System**: Expired tokens automatically cleaned up

## 📊 **Token Comparison**

| Feature | Access Token | Refresh Token |
|---------|-------------|---------------|
| **Purpose** | API authentication | Token renewal |
| **Lifespan** | 15 minutes | 7 days |
| **Storage** | Client memory | Database + Client |
| **Usage** | Every API request | Token refresh only |
| **Revocation** | Blacklist (memory) | Database flag |

## 🛠️ **Implementation Details**

### **Database Schema**
```sql
-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked INTEGER DEFAULT 0,
    revoked_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### **Configuration**
```javascript
// Environment settings
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m          // Access token expiry
JWT_REFRESH_EXPIRES_IN=7d   // Refresh token expiry
```

## 📡 **API Endpoints**

### **1. User Registration**
**`POST /api/auth/signup`**

**Request:**
```json
{
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_password": "securePassword123",
  "role": "buyer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "tokenExpiry": {
    "accessToken": "15m",
    "refreshToken": "7d"
  },
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  },
  "instructions": {
    "message": "Save both tokens for authentication",
    "accessToken": "Short-lived token for API requests",
    "refreshToken": "Long-lived token for getting new access tokens",
    "usage": "Include access token in Authorization header as: Bearer YOUR_ACCESS_TOKEN"
  }
}
```

### **2. User Login**
**`POST /api/auth/login`**

**Request:**
```json
{
  "user_email": "john@example.com",
  "user_password": "securePassword123"
}
```

**Response:** Same format as registration

### **3. Refresh Access Token**
**`POST /api/auth/refresh`**

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Tokens refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x1y2z3w4v5u6...",
  "tokenExpiry": {
    "accessToken": "15m",
    "refreshToken": "7d"
  },
  "user": {
    "userId": 1,
    "email": "john@example.com",
    "role": "buyer"
  },
  "instructions": {
    "message": "Use new tokens for future requests",
    "note": "Old refresh token has been revoked"
  }
}
```

### **4. Secure Logout**
**`POST /api/auth/logout`**

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Logout successful",
  "data": {
    "userId": 1,
    "email": "john@example.com",
    "loggedOutAt": "2025-10-14T10:30:00.000Z",
    "accessTokenInvalidated": true,
    "refreshTokenRevoked": true,
    "instruction": "Both tokens have been invalidated. Please remove from client storage."
  }
}
```

## 💻 **Client Implementation**

### **JavaScript/React Example**

```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/auth';
  }

  // Store tokens securely
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Get stored tokens
  getTokens() {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }

  // Clear tokens
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Login function
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
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
        this.storeTokens(data.accessToken, data.refreshToken);
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Refresh tokens
  async refreshTokens() {
    const { refreshToken } = this.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();
      
      if (data.success) {
        this.storeTokens(data.accessToken, data.refreshToken);
        return data;
      } else {
        this.clearTokens();
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // API request with automatic token refresh
  async apiRequest(url, options = {}) {
    const { accessToken } = this.getTokens();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers
      }
    };

    try {
      let response = await fetch(url, config);
      
      // If token expired, try to refresh and retry
      if (response.status === 401) {
        await this.refreshTokens();
        const { accessToken: newToken } = this.getTokens();
        
        config.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, config);
      }
      
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Logout function
  async logout() {
    const { accessToken, refreshToken } = this.getTokens();
    
    try {
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }
}

// Usage example
const authService = new AuthService();

// Login
await authService.login('user@example.com', 'password');

// Make authenticated API calls
const response = await authService.apiRequest('/api/cart', {
  method: 'GET'
});

// Logout
await authService.logout();
```

### **Axios Interceptor Example**

```javascript
import axios from 'axios';

class TokenManager {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('/api/auth/refresh', {
              refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

new TokenManager();
```

## 🔒 **Security Features**

### **Token Security**
- **Cryptographically Secure**: Refresh tokens use crypto.randomBytes(64)
- **Database Storage**: Refresh tokens hashed and stored securely
- **Automatic Rotation**: New refresh token on each use
- **Revocation Support**: Immediate token invalidation

### **Attack Prevention**
- **Token Replay**: Short access token lifespan
- **Token Theft**: Refresh token rotation
- **Session Hijacking**: Secure token storage
- **Brute Force**: Rate limiting (can be added)

## 🧹 **Maintenance**

### **Cleanup Expired Tokens**
```javascript
const { cleanupExpiredTokens } = require('./utils/refreshToken');

// Run cleanup periodically (e.g., daily cron job)
setInterval(async () => {
  const result = await cleanupExpiredTokens();
  console.log(`Cleaned up ${result.deletedCount} expired tokens`);
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

### **User Token Statistics**
```javascript
const { getUserTokenStats } = require('./utils/refreshToken');

const stats = await getUserTokenStats(userId);
console.log('User token stats:', stats);
```

## 🚀 **Migration from Simple JWT**

### **Before (Simple JWT)**
```javascript
// Old login response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### **After (Refresh Tokens)**
```javascript
// New login response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "tokenExpiry": { ... },
  "user": { ... }
}
```

### **Client Updates Required**
1. Update token storage to handle both tokens
2. Implement refresh token logic
3. Update logout to include refresh token
4. Add automatic token refresh on 401 errors

## ✅ **Benefits**

### **Security Improvements**
- ✅ Reduced attack window (15-minute access tokens)
- ✅ Secure token rotation
- ✅ Immediate revocation capability
- ✅ Database-backed token validation

### **User Experience**
- ✅ Seamless token refresh
- ✅ Extended session duration
- ✅ Automatic re-authentication
- ✅ Secure logout

### **Scalability**
- ✅ Database-backed token management
- ✅ Cleanup mechanisms
- ✅ Token statistics and monitoring
- ✅ Multi-device support

The refresh token system provides enterprise-grade security while maintaining excellent user experience!