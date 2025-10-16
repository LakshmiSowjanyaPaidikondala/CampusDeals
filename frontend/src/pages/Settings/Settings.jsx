import React from 'react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences</p>
      </div>
      
      <div className="settings-content">
        <div className="settings-card">
          <h3>Account Settings</h3>
          <p>Update your personal information and preferences</p>
          <button className="settings-btn">Edit Profile</button>
        </div>
        
        <div className="settings-card">
          <h3>Privacy Settings</h3>
          <p>Manage your privacy and data preferences</p>
          <button className="settings-btn">Manage Privacy</button>
        </div>
        
        <div className="settings-card">
          <h3>Notification Settings</h3>
          <p>Configure how you receive notifications</p>
          <button className="settings-btn">Manage Notifications</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;