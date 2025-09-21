import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Register.css';
import logo from "../assets/logo.png";



const Register = ({ onLoginClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const handleChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    
    let isValid = false;
    if (field === 'name') {
      isValid = validateName(value);
    } else if (field === 'email') {
      isValid = validateEmail(value);
    } else if (field === 'password') {
      isValid = validatePassword(value).isValid;
      // Also revalidate confirm password when password changes
      if (registerData.confirmPassword) {
        setValidationStates(prev => ({
          ...prev,
          confirmPassword: registerData.confirmPassword === value && registerData.confirmPassword.length > 0 ? 'valid' : 'invalid'
        }));
      }
    } else if (field === 'confirmPassword') {
      isValid = value === registerData.password && value.length > 0;
    }
    
    setValidationStates(prev => ({
      ...prev,
      [field]: value ? (isValid ? 'valid' : 'invalid') : 'default'
    }));
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!registerData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateName(registerData.name)) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!registerData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(registerData.password).isValid) {
      newErrors.password = 'Password must contain at least 8 characters, 1 special character, and 1 number';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Handle successful registration
      alert('Registration successful!');
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
    <div className="register-container">
      <div className="register-card">
        {Object.values(errors).some(error => error) && (
          <ErrorPopup message={Object.values(errors).find(error => error)} />
        )}
        
        <div className="logo-section">
          <div className="logo-placeholder">
            <img src={logo} alt="Logo" style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "50%" }} />

          </div>
        </div>

        <h2 className="register-title">
  <span className="highlight-letter">R</span>egister
</h2>


        <div className="form-container">
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={getInputClass('name')}
            />
            {validationStates.name === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          <div className="input-container">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
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
              value={registerData.password}
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

          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={getInputClass('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button onClick={handleSubmit} className="submit-btn">
            Create Account
          </button>
        </div>

        <div className="link-section">
          <span className="link-text">Already have an account? </span>
          <button 
            onClick={onLoginClick}
            className="auth-link"
            type="button"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;