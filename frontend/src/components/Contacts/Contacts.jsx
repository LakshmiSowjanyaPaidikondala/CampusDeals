import React from 'react';
import './Contacts.css';

const Contacts = () => {
  const leftContacts = [
    { id: 1, name: 'Sarah Johnson', phone: '+1 (555) 123-4567' },
    { id: 2, name: 'Michael Chen', phone: '+1 (555) 234-5678' },
    { id: 3, name: 'Emily Rodriguez', phone: '+1 (555) 345-6789' },
    { id: 4, name: 'David Thompson', phone: '+1 (555) 456-7890' },
    { id: 5, name: 'Lisa Anderson', phone: '+1 (555) 567-8901' }
  ];

  const rightContacts = [
    { id: 6, name: 'James Wilson', phone: '+1 (555) 678-9012' },
    { id: 7, name: 'Anna Martinez', phone: '+1 (555) 789-0123' },
    { id: 8, name: 'Robert Kim', phone: '+1 (555) 890-1234' },
    { id: 9, name: 'Jessica Taylor', phone: '+1 (555) 901-2345' },
    { id: 10, name: 'Thomas Brown', phone: '+1 (555) 012-3456' }
  ];

  return (
    <section className="contacts-full-width">
      <div className="contacts-wrapper">
        <div className="contacts-half left-half">
          {leftContacts.map((contact, index) => (
            <div key={contact.id} className="contact-row" style={{ animationDelay: `${index * 0.1}s` }}>
              <span className="contact-name">{contact.name}</span>
              <span className="contact-phone">{contact.phone}</span>
            </div>
          ))}
        </div>
        
        <div className="contacts-half right-half">
          {rightContacts.map((contact, index) => (
            <div key={contact.id} className="contact-row" style={{ animationDelay: `${(index + 5) * 0.1}s` }}>
              <span className="contact-name">{contact.name}</span>
              <span className="contact-phone">{contact.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contacts;