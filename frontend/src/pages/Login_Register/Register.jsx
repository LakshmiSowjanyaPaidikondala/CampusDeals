import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle, Phone, GraduationCap, BookOpen, Users, Home } from 'lucide-react';
import { registerUser, getCart } from '../../utils/auth';
import './Register.css';
import logo from "../../assets/logo.png";

const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    confirmPassword: '',
    user_phone: '',
    user_studyyear: '',
    user_branch: '',
    user_section: '',
    user_residency: '',
    role: 'buyer' // Default role
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

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    
    let isValid = false;
    if (field === 'user_name') {
      isValid = validateName(value);
    } else if (field === 'user_email') {
      isValid = validateEmail(value);
    } else if (field === 'user_password') {
      isValid = validatePassword(value).isValid;
      // Also revalidate confirm password when password changes
      if (registerData.confirmPassword) {
        setValidationStates(prev => ({
          ...prev,
          confirmPassword: registerData.confirmPassword === value && registerData.confirmPassword.length > 0 ? 'valid' : 'invalid'
        }));
      }
    } else if (field === 'confirmPassword') {
      isValid = value === registerData.user_password && value.length > 0;
    } else if (field === 'user_phone') {
      isValid = validatePhone(value);
    } else if (field === 'user_studyyear' || field === 'user_branch' || field === 'user_section' || field === 'user_residency') {
      isValid = value.trim().length > 0;
    }
    
    setValidationStates(prev => ({
      ...prev,
      [field]: value ? (isValid ? 'valid' : 'invalid') : 'default'
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!registerData.user_name) {
      newErrors.user_name = 'Name is required';
    } else if (!validateName(registerData.user_name)) {
      newErrors.user_name = 'Name must be at least 2 characters long';
    }

    if (!registerData.user_email) {
      newErrors.user_email = 'Email is required';
    } else if (!validateEmail(registerData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    if (!registerData.user_password) {
      newErrors.user_password = 'Password is required';
    } else if (!validatePassword(registerData.user_password).isValid) {
      newErrors.user_password = 'Password must contain at least 8 characters, 1 special character, and 1 number';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerData.user_password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerData.user_phone) {
      newErrors.user_phone = 'Phone number is required';
    } else if (!validatePhone(registerData.user_phone)) {
      newErrors.user_phone = 'Please enter a valid 10-digit phone number';
    }

    if (!registerData.user_studyyear) {
      newErrors.user_studyyear = 'Study year is required';
    }

    if (!registerData.user_branch) {
      newErrors.user_branch = 'Branch is required';
    }

    if (!registerData.user_section) {
      newErrors.user_section = 'Section is required';
    }

    if (!registerData.user_residency) {
      newErrors.user_residency = 'Residency status is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...dataToSend } = registerData;
        
        const result = await registerUser(dataToSend);
        
        if (result.success) {
          // Restore cart from localStorage (if any)
          const savedCart = getCart();
          
          // Redirect back to Buy page
          navigate('/buy');
        } else {
          setErrors({ general: result.message || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        setErrors({ general: 'Network error. Please try again.' });
      } finally {
        setLoading(false);
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
          {/* Name Field */}
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={registerData.user_name}
              onChange={(e) => handleChange('user_name', e.target.value)}
              className={getInputClass('user_name')}
            />
            {validationStates.user_name === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Email Field */}
          <div className="input-container">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={registerData.user_email}
              onChange={(e) => handleChange('user_email', e.target.value)}
              className={getInputClass('user_email')}
            />
            {validationStates.user_email === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Phone Field */}
          <div className="input-container">
            <Phone className="input-icon" size={20} />
            <input
              type="tel"
              placeholder="Phone Number"
              value={registerData.user_phone}
              onChange={(e) => handleChange('user_phone', e.target.value)}
              className={getInputClass('user_phone')}
              maxLength="10"
            />
            {validationStates.user_phone === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Study Year Field */}
          <div className="input-container">
            <GraduationCap className="input-icon" size={20} />
            <select
              value={registerData.user_studyyear}
              onChange={(e) => handleChange('user_studyyear', e.target.value)}
              className={getInputClass('user_studyyear')}
            >
              <option value="">Select Study Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            {validationStates.user_studyyear === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Branch Field */}
          <div className="input-container">
            <BookOpen className="input-icon" size={20} />
            <select
              value={registerData.user_branch}
              onChange={(e) => handleChange('user_branch', e.target.value)}
              className={getInputClass('user_branch')}
            >
              <option value="">Select Branch</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Chemical">Chemical</option>
              <option value="Information Technology">Information Technology</option>
            </select>
            {validationStates.user_branch === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Section Field */}
          <div className="input-container">
            <Users className="input-icon" size={20} />
            <select
              value={registerData.user_section}
              onChange={(e) => handleChange('user_section', e.target.value)}
              className={getInputClass('user_section')}
            >
              <option value="">Select Section</option>
              <option value="A">Section 1</option>
              <option value="B">Section 2</option>
              <option value="C">Section 3</option>
              <option value="D">Section 4</option>
            </select>
            {validationStates.user_section === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Residency Field */}
          <div className="input-container">
            <Home className="input-icon" size={20} />
            <select
              value={registerData.user_residency}
              onChange={(e) => handleChange('user_residency', e.target.value)}
              className={getInputClass('user_residency')}
            >
              <option value="">Select Residency</option>
              <option value="Day Scholar">Day Scholar</option>
              <option value="Hosteller">Hosteller</option>
            </select>
            {validationStates.user_residency === 'valid' && (
              <CheckCircle className="validation-icon valid-icon" size={20} />
            )}
          </div>

          {/* Password Field */}
          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={registerData.user_password}
              onChange={(e) => handleChange('user_password', e.target.value)}
              className={getInputClass('user_password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
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

          <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className="link-section">
          <span className="link-text">Already have an account? </span>
          <button 
            onClick={() => navigate('/login')}
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