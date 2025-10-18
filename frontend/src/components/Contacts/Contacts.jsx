import React from 'react';
import './Contacts.css';

const Contacts = () => {
  const allContacts = [
    { id: 1, name: 'Sowjanya', phone: '+91 85149' },
    { id: 2, name: 'Manohar', phone: '+91 8989' },
    { id: 3, name: 'Syamala', phone: '+91 94749' },
    { id: 4, name: 'Rithika', phone: '+91 91716' },
    { id: 5, name: 'Pravallika', phone: '+91 79402' },
    { id: 6, name: 'Krishna Satya', phone: '+91 939456' },
    { id: 7, name: 'Aliya', phone: '+91 838729' },
    { id: 8, name: 'Prakash', phone: '+91 90165' },
  ];

  return (
    <section className="contacts-section">
      <div className="contacts-container">
        <h2 className="contacts-heading">Contact Us</h2>
        
        <div className="contacts-wrapper">
          {allContacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-name">{contact.name}</div>
              <div className="contact-phone">{contact.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contacts;