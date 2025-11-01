# Admin Login API Documentation

## Overview
Dedicated authentication endpoint specifically for admin users. This API provides secure admin login functionality separate from regular user authentication.

## Endpoint Details

### Admin Login
**Endpoint**: `POST /api/auth/admin-login`  
**Description**: Authenticate admin users and receive admin-specific access tokens  
**Authentication**: None required (public endpoint)

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "admin_email": "admin@example.com",
  "admin_password": "AdminPassword123!"
}
```

### Required Fields
- `admin_email` (string): Valid admin email address
- `admin_password` (string): Admin password

## Response Formats

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "✅ Admin login successful",
  "admin": {
    "admin_id": 1,
    "admin_name": "Admin Name",
    "admin_email": "admin@example.com",
    "admin_phone": "+1234567890",
    "admin_studyyear": "Graduate",
    "admin_branch": "Computer Science",
    "admin_section": "A",
    "admin_residency": "On-campus",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiry": {
    "accessToken": "1h",
    "refreshToken": "7d"
  },
  "instructions": {
    "message": "Use accessToken for admin API requests",
    "header": "Authorization: Bearer ACCESS_TOKEN",
    "note": "This token is specifically for admin operations"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "❌ Admin email and password are required",
  "details": "Missing required field validation failed",
  "missingFields": ["admin_email", "admin_password"]
}
```

#### 400 Bad Request - Invalid Email
```json
{
  "success": false,
  "message": "❌ Please provide a valid admin email address",
  "field": "admin_email"
}
```

#### 404 Not Found - Admin Not Found
```json
{
  "success": false,
  "message": "❌ Admin not found",
  "suggestion": "Please check your admin email address",
  "action": "admin_not_found"
}
```

#### 401 Unauthorized - Invalid Password
```json
{
  "success": false,
  "message": "❌ Invalid admin password",
  "suggestion": "Please check your password and try again",
  "field": "admin_password"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "❌ Admin login failed",
  "error": "Server error details (in development mode)"
}
```

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "admin_email": "admin@campusdeals.com",
    "admin_password": "AdminPassword123!"
  }'
```

### JavaScript/Axios Example
```javascript
const axios = require('axios');

const adminLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
      admin_email: 'admin@campusdeals.com',
      admin_password: 'AdminPassword123!'
    });
    
    const { accessToken, admin } = response.data;
    console.log('Admin logged in:', admin.admin_name);
    console.log('Access token:', accessToken);
    
    // Use the token for admin API calls
    const adminEndpoint = await axios.get('http://localhost:5000/api/admins', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
  }
};
```

### PowerShell Example
```powershell
$loginData = @{
    admin_email = "admin@campusdeals.com"
    admin_password = "AdminPassword123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin-login" -Method POST -Body $loginData -ContentType "application/json"

Write-Host "Admin logged in: $($response.admin.admin_name)"
Write-Host "Access Token: $($response.accessToken)"
```

## Token Usage

After successful login, use the received `accessToken` in the Authorization header for all admin API requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Admin-Only Endpoints
The following endpoints require admin authentication:
- `GET /api/admins` - Get all admins
- `GET /api/admins/:id` - Get admin by ID
- `POST /api/admins` - Create new admin
- `PUT /api/admins/:id` - Update admin
- `DELETE /api/admins/:id` - Delete admin

## Security Features

1. **Dedicated Admin Database**: Admins are stored in separate `admins` table
2. **Admin-Specific Tokens**: Tokens are generated with `role: 'admin'`
3. **Role-Based Access**: Admin endpoints verify admin role in token
4. **Password Hashing**: Admin passwords are securely hashed
5. **Input Validation**: Email format and required field validation
6. **Sanitized Responses**: Password excluded from all responses

## Differences from Regular User Login

| Feature | Regular User Login | Admin Login |
|---------|-------------------|-------------|
| Endpoint | `/api/auth/login` | `/api/auth/admin-login` |
| Database Table | `users` | `admins` |
| Token Role | `user.role` or `null` | `'admin'` |
| Access Scope | User endpoints | Admin endpoints |
| Field Names | `user_email`, `user_password` | `admin_email`, `admin_password` |

## Best Practices

1. **Store Tokens Securely**: Keep access tokens in secure storage
2. **Handle Token Expiry**: Implement refresh token logic
3. **Validate Responses**: Check `success` field before processing
4. **Error Handling**: Handle all error scenarios appropriately
5. **HTTPS Only**: Use HTTPS in production environments

## Testing the API

Run the provided test script:
```bash
cd backend
node test-admin-login.js
```

This will test all scenarios including:
- Valid admin login
- Invalid credentials
- Missing fields
- Non-existent admin
- Token usage with admin endpoints