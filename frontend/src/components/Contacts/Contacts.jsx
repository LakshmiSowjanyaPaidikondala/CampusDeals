// Contacts.jsx
import React, { useState, useEffect } from 'react';
import './Contacts.css';

// Import logo images
import instagramLogo from '../../assets/logos/Instagram.png';
import linkedinLogo from '../../assets/logos/linkedin.png';
import gmailLogo from '../../assets/logos/Gmail.png';

const Contacts = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // const founders = [
  //   { id: 1, name: 'Harsha' },
  //   { id: 2, name: 'Bhargavi' },
  //   { id: 3, name: 'Surya' },
  //   { id: 4, name: 'Bhaskar' }
  // ];

  const contributors = [
    { id: 1, name: 'Sowjanya', phone: '+91 8555938149' },
    { id: 2, name: 'Manohar', phone: '+91 89877230089' },
    { id: 3, name: 'Syamala', phone: '+91 9494728749' },
    { id: 4, name: 'Rithika', phone: '+91 9182688716' },
    { id: 5, name: 'Pravallika', phone: '+91 7989558402' },
    { id: 6, name: 'Krishna Satya', phone: '+91 9392640456' },
    { id: 7, name: 'Aliya', phone: '+91 8309348729' },
    { id: 8, name: 'Prakash', phone: '+91 9059600165' },
  ];

  const socialLinks = [
    {
      id: 1,
      platform: 'Instagram',
      logo: instagramLogo,
      url: 'https://www.instagram.com/campus_deals_?igsh=aDUyeXU2bGt6cXJ2',
      handle: '@campusdeals'
    },
    {
      id: 2,
      platform: 'LinkedIn',
      logo: linkedinLogo,
      url: 'https://www.linkedin.com/company/campus-deals/',
      handle: 'Campus Deals'
    },
    {
      id: 3,
      platform: 'Gmail',
      logo: gmailLogo,
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=campusdealsonline@gmail.com',
      handle: 'campusdealsonline@gmail.com'
    }
  ];

  const totalSlides = contributors.length;

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="contacts-section">

        
        
        
        <div className="contacts-layout">
          {/* Social Links Section - Left Side */}
          <div className="social-section">
            <h3 className="section-title">Connect With Us</h3>
            <div className="social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={social.logo} alt={social.platform} className="social-icon" />
                  <div className="social-info">
                    <div className="social-platform">{social.platform}</div>
                    <div className="social-handle">{social.handle}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Founders and Contributors Section - Right Side */}
          {/* <div className="right-section">
            {/* Founders Section */}
            {/* <div className="founders-section">
              <h3 className="section-title">Founders</h3>
              <div className="founders-grid">
                {founders.map((founder) => (
                  <div key={founder.id} className="founder-card">
                    <div className="founder-name">{founder.name}</div>
                  </div>
                ))}
              </div>
            </div> */} 

            {/* Contributors Slider Section - Below Founders */}
            <div className="contributors-section">
              <h3 className="section-title">Our Contributors</h3>
              <div className="slider-container">
                <button className="slider-arrow prev-arrow" onClick={prevSlide}>
                  ‹
                </button>
                
                <div className="slider-content">
                  <div className="contributor-slide">
                    <div className="contributor-card">
                      <div className="contributor-name">{contributors[currentSlide]?.name}</div>
                      <div className="contributor-phone">{contributors[currentSlide]?.phone}</div>
                    </div>
                  </div>
                </div>

                <button className="slider-arrow next-arrow" onClick={nextSlide}>
                  ›
                </button>
              </div>
              
              {/* Slider Indicators */}
              <div className="slider-indicators">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        
      {/* </div> */}
    </section>
  );
};

export default Contacts;