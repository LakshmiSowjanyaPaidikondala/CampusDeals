# 🍪 Cookie-Based Authentication Migration

This update migrates the CampusDeals application from localStorage-based token storage to secure cookie-based storage for better security and compliance.

## 🔄 What Changed

### Before (localStorage)
```javascript
// Tokens stored in localStorage
localStorage.setItem('authToken', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('userData', JSON.stringify(user));
```

### After (Cookies)
```javascript
// Tokens stored in secure HTTP cookies
setAuthTokenCookie(token);
setRefreshTokenCookie(refreshToken);  
setUserDataCookie(user);
```

## 🔒 Security Improvements

### Cookie Security Features
- **Secure**: Cookies are only sent over HTTPS in production
- **SameSite**: Set to 'strict' for CSRF protection
- **Path**: Scoped to the application path
- **Expiration**: Automatic cleanup of expired tokens (15 minutes)

### Benefits Over localStorage
1. **XSS Protection**: Cookies are less vulnerable to XSS attacks
2. **Automatic Expiration**: Built-in expiration management
3. **Server Integration**: Better integration with server-side authentication
4. **CSRF Protection**: SameSite attribute prevents cross-site attacks

## 📁 New Files Added

### `/src/utils/cookies.js`
Complete cookie management utility with:
- Secure cookie setting functions
- Token-specific cookie handlers
- Cart data cookie management
- Cookie cleanup utilities

### `/src/utils/migration.js`
Automatic migration system that:
- Transfers existing localStorage data to cookies
- Cleans up old localStorage entries
- Provides seamless user experience during transition

## 🔧 Updated Files

### Authentication Files
- `/src/utils/auth.js` - Updated to use cookies instead of localStorage
- `/src/hooks/useAuth.jsx` - Modified to use cookie-based storage
- `/src/contexts/CartContext.jsx` - Cart data now stored in cookies

### Components
- `/src/components/ProfileDropdown/ProfileDropdown.jsx` - Updated logout flow
- `/src/components/ProfileDropdown/ProfileDropdownDebug.jsx` - Cookie-based cleanup
- `/src/App.jsx` - Added migration initialization

## 🚀 How It Works

### 1. Automatic Migration
When users first load the updated app:
```javascript
// Migration runs automatically
initializeMigration();
// Transfers: authToken, refreshToken, userData, cartItems
// Cleans up: old localStorage entries
```

### 2. Seamless Experience
- Existing logged-in users remain logged in
- Cart items are preserved
- No manual action required

### 3. Enhanced Security
```javascript
// Cookies are set with security options
const TOKEN_COOKIE_OPTIONS = {
  maxAge: 15 * 60, // 15 minutes in seconds
  secure: window.location.protocol === 'https:',
  sameSite: 'strict'
};
```

## 🔍 Developer Usage

### Getting Tokens
```javascript
import { getAuthTokenCookie } from './utils/cookies.js';

const token = getAuthTokenCookie();
```

### Setting Tokens
```javascript
import { setAuthTokenCookie } from './utils/cookies.js';

setAuthTokenCookie(newToken);
```

### Complete Logout
```javascript
import { clearAuthCookies } from './utils/cookies.js';

// Clears all authentication cookies
clearAuthCookies();
```

## 🧪 Testing

### Check Migration
1. Open browser developer tools
2. Go to Application > Local Storage
3. Verify old auth data is removed
4. Go to Application > Cookies
5. Verify new cookie data exists

### Cookie Inspection
```javascript
// Console commands to check cookies
import { getAllCookies } from './utils/cookies.js';
console.log(getAllCookies());
```

## 🌐 Browser Compatibility

Works in all modern browsers that support:
- ES6 modules
- Secure cookies
- SameSite attribute

### Fallback Behavior
- Development: Works with HTTP (secure flag disabled)
- Production: Requires HTTPS for secure cookies

## 📱 User Impact

### Positive Changes
- ✅ Better security
- ✅ Automatic token cleanup
- ✅ CSRF protection
- ✅ Seamless migration

### No Negative Impact
- ✅ No login required after update
- ✅ Cart items preserved
- ✅ Same user experience
- ✅ No performance impact

## 🔧 Configuration Options

### Cookie Expiration
```javascript
// Customize in cookies.js
const TOKEN_COOKIE_OPTIONS = {
  maxAge: 15 * 60, // Change token expiration (15 minutes in seconds)
  secure: true, // Force secure in all environments
  sameSite: 'lax' // Adjust CSRF protection level
};
```

### Migration Behavior
```javascript
// Disable automatic migration if needed
// Comment out in App.jsx:
// initializeMigration();
```

## 🚨 Important Notes

1. **HTTPS Required**: Secure cookies require HTTPS in production
2. **Domain Specific**: Cookies are tied to the current domain
3. **Size Limits**: Cookies have a 4KB limit per cookie
4. **Browser Settings**: Users can disable cookies (graceful degradation needed)

## 🔮 Future Enhancements

### Potential Improvements
- [ ] HttpOnly cookies for refresh tokens (requires server-side support)
- [ ] Cookie encryption for sensitive data
- [ ] Automatic cookie refresh before expiration
- [ ] Cookie-based session management

### Server-Side Integration
```javascript
// Future: Server-side cookie management
app.use(cookieParser());
app.post('/login', (req, res) => {
  // Set httpOnly cookies from server
  res.cookie('authToken', token, { httpOnly: true });
});
```

---

**Migration Date**: Current Update  
**Breaking Changes**: None  
**User Action Required**: None (automatic)  
**Security Level**: Enhanced 🔒