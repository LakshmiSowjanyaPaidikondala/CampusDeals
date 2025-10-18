import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getCart } from '../../utils/auth';
import './Login.css';
import logo from "../../assets/logo.png";


const Login = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [validationStates, setValidationStates] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const minLength = password.length >= 8;
    return { hasSpecialChar, hasNumber, minLength, isValid: hasSpecialChar && hasNumber && minLength };
  };

  const handleChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    
    let isValid = false;
    if (field === 'email') {
      isValid = validateEmail(value);
    } else if (field === 'password') {
      isValid = validatePassword(value).isValid;
    }
    
    setValidationStates(prev => ({
      ...prev,
      [field]: value ? (isValid ? 'valid' : 'invalid') : 'default'
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await login(loginData.email, loginData.password);
        
        if (result.success) {
          // Restore cart from localStorage (if any)
          const savedCart = getCart();
          
          // Redirect back to Buy page
          navigate('/');
        } else {
          setErrors({ general: result.error || 'Login failed. Please try again.' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Network error. Please try again.' });
      }
    }
  };

  const getInputClass = (field) => {
    const state = validationStates[field];
    if (state === 'valid') return 'input-field valid';
    if (state === 'invalid') return 'input-field invalid';
    return 'input-field';
  };

  const ErrorPopup = ({ message }) => (
    <div className="error-popup">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="login-container">
      <div className="login-card">
        {Object.values(errors).some(error => error) && (
          <ErrorPopup message={Object.values(errors).find(error => error)} />
        )}
        
        <div className="logo-section">
          <div className="logo-placeholder">
            <img src={logo} alt="Logo" style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "50%" }} />

          </div>
        </div>

        <h2 className="login-title">
  <span className="highlight-letter">L</span>ogin
</h2>


        <div className="form-container">
          <div className="input-container">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={getInputClass('email')}
            />
            {validationStates.email === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={getInputClass('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button onClick={handleSubmit} className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="link-section">
          <span className="link-text">Don't have an account? </span>
          <button 
            onClick={() => navigate('/register')}
            className="auth-link"
            type="button"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;