# Admin Registration API Documentation

## Overview
Dedicated registration endpoint for creating new admin users. This API provides secure admin account creation with automatic authentication token generation.

## Endpoint Details

### Admin Registration
**Endpoint**: `POST /api/auth/admin-register`  
**Description**: Create new admin accounts with automatic login  
**Authentication**: None required (public endpoint)

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "admin_name": "Admin Full Name",
  "admin_email": "admin@example.com",
  "admin_password": "SecureAdminPass123!",
  "admin_phone": "+1234567890",
  "admin_studyyear": "Graduate",
  "admin_branch": "Computer Science",
  "admin_section": "A",
  "admin_residency": "On-campus"
}
```

### Required Fields
- `admin_name` (string): Full name of the admin
- `admin_email` (string): Valid admin email address (must be unique)
- `admin_password` (string): Strong password meeting security requirements

### Optional Fields
- `admin_phone` (string): Contact phone number
- `admin_studyyear` (string): Academic year/level
- `admin_branch` (string): Department or branch
- `admin_section` (string): Section or division
- `admin_residency` (string): Residence type

## Response Formats

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "✅ Admin registered successfully",
  "admin": {
    "admin_id": 1,
    "admin_name": "Admin Full Name",
    "admin_email": "admin@example.com",
    "admin_phone": "+1234567890",
    "admin_studyyear": "Graduate",
    "admin_branch": "Computer Science",
    "admin_section": "A",
    "admin_residency": "On-campus",
    "created_at": "2025-10-29T12:00:00.000Z",
    "updated_at": "2025-10-29T12:00:00.000Z",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiry": {
    "accessToken": "1h",
    "refreshToken": "7d"
  },
  "instructions": {
    "message": "Admin account created and logged in automatically",
    "usage": "Use accessToken for admin API requests",
    "header": "Authorization: Bearer ACCESS_TOKEN",
    "note": "This token is specifically for admin operations"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "message": "❌ Missing required fields for admin registration",
  "details": "Missing required field validation failed",
  "missingFields": ["admin_name", "admin_email", "admin_password"]
}
```

#### 400 Bad Request - Invalid Email Format
```json
{
  "success": false,
  "message": "❌ Please provide a valid admin email address",
  "field": "admin_email"
}
```

#### 400 Bad Request - Weak Password
```json
{
  "success": false,
  "message": "❌ Admin password validation failed",
  "details": "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  "field": "admin_password"
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "success": false,
  "message": "❌ Admin with this email already exists",
  "suggestion": "Please use admin login instead or use a different email address",
  "field": "admin_email"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "❌ Admin registration failed",
  "error": "Server error details (in development mode)"
}
```

## Password Requirements

Admin passwords must meet the following criteria:
- **Minimum 8 characters**
- **At least 1 uppercase letter**
- **At least 1 lowercase letter**
- **At least 1 number**
- **At least 1 special character** (!@#$%^&*)

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:5000/api/auth/admin-register \
  -H "Content-Type: application/json" \
  -d '{
    "admin_name": "John Admin",
    "admin_email": "john@campusdeals.com",
    "admin_password": "SecureAdminPass123!",
    "admin_phone": "+1234567890",
    "admin_studyyear": "Graduate",
    "admin_branch": "Computer Science",
    "admin_section": "A",
    "admin_residency": "On-campus"
  }'
```

### Minimal Registration (Required Fields Only)
```bash
curl -X POST http://localhost:5000/api/auth/admin-register \
  -H "Content-Type: application/json" \
  -d '{
    "admin_name": "Jane Admin",
    "admin_email": "jane@campusdeals.com",
    "admin_password": "StrongPassword123!"
  }'
```

### JavaScript/Axios Example
```javascript
const axios = require('axios');

const registerAdmin = async () => {
  try {
    const adminData = {
      admin_name: 'New Admin',
      admin_email: 'newadmin@campusdeals.com',
      admin_password: 'SecurePass123!',
      admin_phone: '+1234567890',
      admin_studyyear: 'Graduate',
      admin_branch: 'Computer Science',
      admin_section: 'A',
      admin_residency: 'On-campus'
    };
    
    const response = await axios.post(
      'http://localhost:5000/api/auth/admin-register',
      adminData
    );
    
    const { admin, accessToken } = response.data;
    console.log('Admin registered:', admin.admin_name);
    console.log('Access token:', accessToken);
    
    // Admin is automatically logged in - use token immediately
    const adminEndpoint = await axios.get('http://localhost:5000/api/admins', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
  } catch (error) {
    console.error('Registration failed:', error.response.data.message);
  }
};
```

### PowerShell Example
```powershell
$adminData = @{
    admin_name = "PowerShell Admin"
    admin_email = "ps@campusdeals.com"
    admin_password = "PowerShellPass123!"
    admin_phone = "+1234567890"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin-register" -Method POST -Body $adminData -ContentType "application/json"

Write-Host "Admin registered: $($response.admin.admin_name)"
Write-Host "Access Token: $($response.accessToken)"
```

## Auto-Login Feature

After successful registration, the admin is **automatically logged in** and receives:
- **Access Token**: For immediate API access
- **Refresh Token**: For token renewal
- **Admin Profile**: Complete admin information

No separate login call is needed after registration.

## Token Usage

Use the received `accessToken` immediately for admin API requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Admin Endpoints Available
- `GET /api/admins` - Get all admins
- `GET /api/admins/:id` - Get admin by ID
- `POST /api/admins` - Create new admin
- `PUT /api/admins/:id` - Update admin
- `DELETE /api/admins/:id` - Delete admin

## Security Features

1. **Unique Email Validation**: Prevents duplicate admin accounts
2. **Strong Password Requirements**: Enforces secure passwords
3. **Input Sanitization**: All inputs are sanitized
4. **Secure Password Hashing**: Passwords stored with bcrypt
5. **Automatic Token Generation**: Secure JWT tokens
6. **Role Assignment**: Automatic admin role assignment

## Workflow Integration

### Typical Admin Registration Flow
1. **Register Admin**: `POST /api/auth/admin-register`
2. **Receive Tokens**: Access and refresh tokens provided
3. **Access Admin APIs**: Use tokens immediately
4. **Manage System**: Full admin privileges granted

### With Existing Admin Login
1. **Register**: Create account with admin-register
2. **Future Logins**: Use `POST /api/auth/admin-login`
3. **Token Management**: Refresh tokens as needed

## Differences from User Registration

| Feature | User Registration | Admin Registration |
|---------|------------------|-------------------|
| Endpoint | `/api/auth/signup` | `/api/auth/admin-register` |
| Database Table | `users` | `admins` |
| Token Role | `null` (assigned later) | `'admin'` |
| Access Scope | User endpoints | Admin endpoints |
| Field Prefix | `user_*` | `admin_*` |
| Auto-Role | Dynamic assignment | Fixed 'admin' role |

## Best Practices

1. **Secure Passwords**: Use strong, unique passwords
2. **Valid Email**: Use institutional or official email addresses
3. **Complete Profile**: Fill optional fields for better identification
4. **Token Security**: Store tokens securely in client
5. **HTTPS Only**: Use secure connections in production

## Testing the API

Run the provided test script:
```bash
cd backend
node test-admin-register.js
```

This comprehensive test covers:
- Complete registration with all fields
- Minimal registration with required fields only
- Duplicate email validation
- Invalid email format validation
- Password strength validation
- Missing fields validation
- Auto-login verification
- Token functionality with admin endpoints