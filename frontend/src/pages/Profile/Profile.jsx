import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Home, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  Camera,
  Calendar,
  MapPin,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, apiCall, isLoading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSimpleView, setShowSimpleView] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Enhanced mock user data with additional fields
  const mockUser = {
    user_name: 'John Doe',
    user_email: 'john.doe@campus.edu',
    user_phone: '9876543210',
    user_studyyear: '3rd Year',
    user_branch: 'Computer Science',
    user_section: 'A',
    user_residency: 'Day Scholar',
    created_at: '2024-01-15T10:30:00Z',
    total_orders: 15,
    products_sold: 8,
    wishlist_count: 23,
    avatar: null,
    bio: 'Computer Science student passionate about technology and innovation.',
    address: 'Campus Hostel Block A, Room 201',
    semester: '6th Semester',
    gpa: '8.5',
    interests: ['Programming', 'Reading', 'Gaming', 'Music']
  };

  const displayUser = user || mockUser;

  useEffect(() => {
    try {
      setEditedUser({ ...displayUser });
    } catch (error) {
      console.error('Error setting edited user:', error);
    }
  }, [user]); // Update when user changes

  const handleInputChange = (field, value) => {
    try {
      setEditedUser(prev => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      console.error('Error handling input change:', error);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        handleInputChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editedUser.user_name?.trim()) {
      newErrors.user_name = 'Name is required';
    } else if (editedUser.user_name.trim().length < 2) {
      newErrors.user_name = 'Name must be at least 2 characters';
    }

    if (!editedUser.user_email?.trim()) {
      newErrors.user_email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedUser.user_email)) {
        newErrors.user_email = 'Please enter a valid email address';
      }
    }

    if (!editedUser.user_phone?.trim()) {
      newErrors.user_phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(editedUser.user_phone)) {
        newErrors.user_phone = 'Please enter a valid 10-digit phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (updateUser && typeof updateUser === 'function') {
        // For now, just update locally since we have mock data
        updateUser(editedUser);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setAvatarPreview(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // Fallback: just show success message
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setAvatarPreview(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    try {
      setEditedUser({ ...displayUser });
      setIsEditing(false);
      setErrors({});
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error canceling edit:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    try {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } catch (error) {
      return 'U';
    }
  };

  const toggleView = () => {
    setShowSimpleView(!showSimpleView);
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Simple view for testing purposes (inspired by SimpleProfile.jsx)
  if (showSimpleView) {
    return (
      <div className="simple-profile-container">
        <div className="simple-profile-header">
          <button 
            className="view-toggle-btn"
            onClick={toggleView}
          >
            <Eye size={16} />
            Switch to Full View
          </button>
        </div>
        <div className="simple-profile-content">
          <h1>Profile Page</h1>
          <p>This is a simplified profile page to test routing.</p>
          <div className="simple-profile-card">
            <h2>User Information</h2>
            <p><strong>Name:</strong> {displayUser.user_name}</p>
            <p><strong>Email:</strong> {displayUser.user_email}</p>
            <p><strong>Branch:</strong> {displayUser.user_branch}</p>
            <p><strong>Year:</strong> {displayUser.user_studyyear}</p>
            <p><strong>Phone:</strong> {displayUser.user_phone}</p>
            <p><strong>Section:</strong> {displayUser.user_section}</p>
            <p><strong>Residency:</strong> {displayUser.user_residency}</p>
          </div>
        </div>
      </div>
    );
  }

  // Full featured profile view
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-banner">
          <div className="banner-gradient"></div>
        </div>
        
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {avatarPreview || displayUser.avatar ? (
              <img src={avatarPreview || displayUser.avatar} alt={displayUser.user_name} />
            ) : (
              <span className="avatar-initials">{getInitials(displayUser.user_name)}</span>
            )}
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-file-input"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="avatar-edit-btn">
                  <Camera size={16} />
                </label>
              </>
            )}
            {!isEditing && (
              <button className="avatar-edit-btn" disabled>
                <Camera size={16} />
              </button>
            )}
          </div>
          
          <div className="profile-basic-info">
            <h1 className="profile-name">{displayUser.user_name}</h1>
            <p className="profile-email">{displayUser.user_email}</p>
            <div className="profile-status">
              <span className="status-indicator online"></span>
              <span>Online</span>
            </div>
            {displayUser.bio && (
              <p className="profile-bio">{displayUser.bio}</p>
            )}
          </div>

          <div className="profile-actions">
            <button 
              className="view-toggle-btn"
              onClick={toggleView}
              title="Switch to simple view"
            >
              <EyeOff size={16} />
              Simple View
            </button>
            
            {!isEditing ? (
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.general && (
        <div className="error-message">
          <X size={20} />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label className="field-label">
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <div className="field-edit">
                  <input
                    type="text"
                    value={editedUser.user_name || ''}
                    onChange={(e) => handleInputChange('user_name', e.target.value)}
                    className={`edit-input ${errors.user_name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.user_name && <span className="field-error">{errors.user_name}</span>}
                </div>
              ) : (
                <div className="field-value">{displayUser.user_name || 'Not provided'}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">
                <Mail size={16} />
                Email Address
              </label>
              {isEditing ? (
                <div className="field-edit">
                  <input
                    type="email"
                    value={editedUser.user_email || ''}
                    onChange={(e) => handleInputChange('user_email', e.target.value)}
                    className={`edit-input ${errors.user_email ? 'error' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.user_email && <span className="field-error">{errors.user_email}</span>}
                </div>
              ) : (
                <div className="field-value">{displayUser.user_email || 'Not provided'}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <div className="field-edit">
                  <input
                    type="tel"
                    value={editedUser.user_phone || ''}
                    onChange={(e) => handleInputChange('user_phone', e.target.value)}
                    className={`edit-input ${errors.user_phone ? 'error' : ''}`}
                    placeholder="Enter your phone number"
                    maxLength="10"
                  />
                  {errors.user_phone && <span className="field-error">{errors.user_phone}</span>}
                </div>
              ) : (
                <div className="field-value">{displayUser.user_phone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Academic Information</h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label className="field-label">
                <GraduationCap size={16} />
                Study Year
              </label>
              {isEditing ? (
                <select
                  value={editedUser.user_studyyear || ''}
                  onChange={(e) => handleInputChange('user_studyyear', e.target.value)}
                  className="edit-input"
                >
                  <option value="">Select Study Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              ) : (
                <div className="field-value">{displayUser.user_studyyear || 'Not provided'}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">
                <BookOpen size={16} />
                Branch
              </label>
              {isEditing ? (
                <select
                  value={editedUser.user_branch || ''}
                  onChange={(e) => handleInputChange('user_branch', e.target.value)}
                  className="edit-input"
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
              ) : (
                <div className="field-value">{displayUser.user_branch || 'Not provided'}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">
                <Users size={16} />
                Section
              </label>
              {isEditing ? (
                <select
                  value={editedUser.user_section || ''}
                  onChange={(e) => handleInputChange('user_section', e.target.value)}
                  className="edit-input"
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              ) : (
                <div className="field-value">{displayUser.user_section || 'Not provided'}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">
                <Home size={16} />
                Residency
              </label>
              {isEditing ? (
                <select
                  value={editedUser.user_residency || ''}
                  onChange={(e) => handleInputChange('user_residency', e.target.value)}
                  className="edit-input"
                >
                  <option value="">Select Residency</option>
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hosteller">Hosteller</option>
                </select>
              ) : (
                <div className="field-value">{displayUser.user_residency || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Account Statistics</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{displayUser.total_orders || 0}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{displayUser.products_sold || 0}</div>
                <div className="stat-label">Products Sold</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;