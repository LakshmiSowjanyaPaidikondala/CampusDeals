# Logout API Documentation

## 📝 Overview
The logout API provides secure user logout functionality with JWT token invalidation.

## 🚪 Logout Endpoint

### `POST /api/auth/logout`

**Description:** Logs out the authenticated user and invalidates their JWT token.

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** None required

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "✅ Logout successful",
  "data": {
    "userId": 12,
    "email": "user@example.com",
    "loggedOutAt": "2025-10-14T10:30:00.000Z",
    "tokenInvalidated": true,
    "instruction": "Token has been invalidated. Please remove from client storage."
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "❌ Access token required"
}
```

**Response (Error - 401 - Blacklisted Token):**
```json
{
  "message": "❌ Token has been invalidated. Please login again."
}
```

**Response (Error - 403):**
```json
{
  "message": "❌ Invalid or expired token"
}
```

## 🔧 Implementation Features

### 1. **Token Blacklisting**
- Tokens are added to an in-memory blacklist upon logout
- Blacklisted tokens cannot be reused for authentication
- Prevents token reuse after logout

### 2. **Security Benefits**
- Immediate token invalidation
- Protection against token theft after logout
- Proper session termination

### 3. **Client-Side Requirements**
After successful logout, clients should:
- Remove JWT token from localStorage/sessionStorage
- Clear any cached user data
- Redirect to login page

## 📋 Usage Examples

### JavaScript (Fetch API)
```javascript
// Logout function
async function logout() {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Remove token from storage
      localStorage.removeItem('authToken');
      
      // Redirect to login
      window.location.href = '/login';
      
      console.log('✅ Logged out successfully');
    } else {
      console.error('❌ Logout failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## ⚠️ Important Notes

1. **Token Storage:** The blacklist is currently in-memory and will reset on server restart
2. **Production Considerations:** For production, consider using Redis or database storage for token blacklisting
3. **Cleanup:** Blacklisted tokens should be cleaned up after JWT expiration
4. **Multiple Devices:** Users need to logout from each device separately

## 🔄 Related Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `GET /api/auth/profile` - Get user profile (requires authentication)

## 🛡️ Security Features

- ✅ JWT token invalidation
- ✅ In-memory token blacklisting
- ✅ Automatic token validation on protected routes
- ✅ Secure logout logging
- ✅ Error handling for invalid tokens