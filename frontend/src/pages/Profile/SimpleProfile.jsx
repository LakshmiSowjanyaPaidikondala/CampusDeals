import React from 'react';

const SimpleProfile = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1>Profile Page</h1>
      <p>This is a simplified profile page to test routing.</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '12px',
        marginTop: '2rem',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john.doe@campus.edu</p>
        <p><strong>Branch:</strong> Computer Science</p>
        <p><strong>Year:</strong> 3rd Year</p>
      </div>
    </div>
  );
};

export default SimpleProfile;