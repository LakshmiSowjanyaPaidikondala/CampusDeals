# Complete Admin Authentication API Guide

## Overview
This guide covers all admin authentication endpoints including registration, login, and token management for the CampusDeals admin system.

## Quick Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/admin-register` | POST | Create new admin account | No |
| `/api/auth/admin-login` | POST | Admin login | No |
| `/api/auth/logout` | POST | Logout (blacklist tokens) | Yes |
| `/api/auth/refresh` | POST | Refresh access token | No |

## 1. Admin Registration

### Create New Admin Account
**Endpoint**: `POST /api/auth/admin-register`

```bash
curl -X POST http://localhost:5000/api/auth/admin-register \
  -H "Content-Type: application/json" \
  -d '{
    "admin_name": "New Admin",
    "admin_email": "admin@campusdeals.com",
    "admin_password": "SecurePass123!",
    "admin_phone": "+1234567890"
  }'
```

**Features**:
- ✅ Creates admin account in `admins` table
- ✅ Automatic login after registration
- ✅ Returns access and refresh tokens
- ✅ Strong password validation
- ✅ Email uniqueness validation

## 2. Admin Login

### Authenticate Existing Admin
**Endpoint**: `POST /api/auth/admin-login`

```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "admin_email": "admin@campusdeals.com",
    "admin_password": "SecurePass123!"
  }'
```

**Features**:
- ✅ Validates against `admins` table only
- ✅ Generates admin-specific tokens
- ✅ Returns admin profile information
- ✅ Sets role to 'admin' in tokens

## 3. Token Management

### Token Structure
Both endpoints return the same token structure:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenExpiry": {
    "accessToken": "1h",
    "refreshToken": "7d"
  }
}
```

### Using Tokens
Include access token in all admin API requests:

```bash
curl -X GET http://localhost:5000/api/admins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Complete Workflow Examples

### New Admin Setup
```javascript
// 1. Register new admin
const registerResponse = await axios.post('/api/auth/admin-register', {
  admin_name: 'John Admin',
  admin_email: 'john@campusdeals.com',
  admin_password: 'SecurePass123!'
});

// 2. Extract tokens (admin is automatically logged in)
const { accessToken, admin } = registerResponse.data;

// 3. Use tokens immediately for admin operations
const adminsResponse = await axios.get('/api/admins', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Existing Admin Login
```javascript
// 1. Login existing admin
const loginResponse = await axios.post('/api/auth/admin-login', {
  admin_email: 'john@campusdeals.com',
  admin_password: 'SecurePass123!'
});

// 2. Extract tokens
const { accessToken, refreshToken } = loginResponse.data;

// 3. Use tokens for admin operations
const createAdminResponse = await axios.post('/api/admins', {
  admin_name: 'Another Admin',
  admin_email: 'another@campusdeals.com',
  admin_password: 'AnotherPass123!'
}, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Token Refresh
```javascript
// When access token expires, use refresh token
const refreshResponse = await axios.post('/api/auth/refresh', {
  refreshToken: refreshToken
});

const { accessToken: newAccessToken } = refreshResponse.data;
```

## 5. Error Handling

### Common Error Responses

#### Registration Errors
```json
// Duplicate email
{
  "success": false,
  "message": "❌ Admin with this email already exists",
  "field": "admin_email"
}

// Weak password
{
  "success": false,
  "message": "❌ Admin password validation failed",
  "details": "Password requirements not met",
  "field": "admin_password"
}
```

#### Login Errors
```json
// Admin not found
{
  "success": false,
  "message": "❌ Admin not found",
  "action": "admin_not_found"
}

// Wrong password
{
  "success": false,
  "message": "❌ Invalid admin password",
  "field": "admin_password"
}
```

## 6. Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Token Security
- Store tokens securely (not in localStorage for production)
- Use HTTPS in production
- Implement proper token expiry handling
- Logout to blacklist tokens when done

### Email Validation
- Must be valid email format
- Must be unique across all admins
- Case-insensitive validation

## 7. Integration with Admin Endpoints

### Admin-Only Endpoints
These endpoints require admin tokens from the authentication APIs:

```bash
# Get all admins
GET /api/admins
Authorization: Bearer ADMIN_ACCESS_TOKEN

# Create new admin
POST /api/admins
Authorization: Bearer ADMIN_ACCESS_TOKEN

# Update admin
PUT /api/admins/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN

# Delete admin
DELETE /api/admins/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Role Verification
The system automatically verifies that tokens have `role: 'admin'`:

```javascript
// In middleware
if (decoded.role !== 'admin') {
  return res.status(403).json({
    message: 'Admin access required'
  });
}
```

## 8. Testing

### Test Scripts Available
```bash
# Test admin registration
node test-admin-register.js

# Test admin login
node test-admin-login.js

# Test complete authentication flow
node test-admin-auth-complete.js
```

### Manual Testing
```bash
# 1. Register first admin
curl -X POST http://localhost:5000/api/auth/admin-register \
  -H "Content-Type: application/json" \
  -d '{"admin_name":"Test Admin","admin_email":"test@admin.com","admin_password":"TestPass123!"}'

# 2. Login with admin
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"admin_email":"test@admin.com","admin_password":"TestPass123!"}'

# 3. Use token with admin endpoints
curl -X GET http://localhost:5000/api/admins \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 9. Comparison with User Authentication

| Feature | User Auth | Admin Auth |
|---------|-----------|------------|
| Registration | `/api/auth/signup` | `/api/auth/admin-register` |
| Login | `/api/auth/login` | `/api/auth/admin-login` |
| Database | `users` table | `admins` table |
| Token Role | Dynamic or null | Always 'admin' |
| Access Scope | User endpoints | Admin endpoints |
| Field Names | `user_*` | `admin_*` |

## 10. Production Considerations

### Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Security Headers
```javascript
// Add security headers
app.use(helmet());
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

### Rate Limiting
```javascript
// Implement rate limiting for auth endpoints
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.use('/api/auth/admin-login', authLimiter);
app.use('/api/auth/admin-register', authLimiter);
```

This complete guide provides everything needed to implement and use the admin authentication system effectively.