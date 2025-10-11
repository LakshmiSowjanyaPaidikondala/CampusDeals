import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import './FAQ.css';

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const faqData = [
    {
      id: 1,
      question: "How do I buy items on Campus Deals?",
      answer:
        "Simply browse through available items, click on what interests you, and contact the seller directly through our secure messaging system. All transactions are between students for maximum trust and convenience."
    },
    {
      id: 2,
      question: "Is it safe to sell my items here?",
      answer:
        "Absolutely! Campus Deals is designed exclusively for verified students. We provide guidelines for safe transactions, meeting recommendations, and a rating system to ensure trustworthy exchanges within your campus community."
    },
    {
      id: 3,
      question: "What can I sell on this platform?",
      answer:
        "You can sell textbooks, electronics, furniture, clothing, study materials, sports equipment, and any other items that would be useful to fellow students. We only restrict illegal or prohibited items."
    },
    {
      id: 4,
      question: "How do I contact other students?",
      answer:
        "Once you find an item you're interested in, you can message the seller directly through our built-in chat system. This keeps your personal information private while enabling smooth communication."
    },
    {
      id: 5,
      question: "Are there any fees for using Campus Deals?",
      answer:
        "Campus Deals is completely free for students! There are no listing fees, transaction fees, or membership costs. We believe in supporting the student community with accessible, cost-free services."
    },
    {
      id: 6,
      question: "How do I verify my student status?",
      answer:
        "During registration, you'll need to provide your student email address and student ID. We verify this information to ensure our platform remains exclusive to the student community for enhanced safety and trust."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const faqElement = document.querySelector('.faq-wrapper');
    if (faqElement) {
      observer.observe(faqElement);
    }

    return () => {
      if (faqElement) {
        observer.unobserve(faqElement);
      }
    };
  }, []);

  const toggleQuestion = (questionId) => {
    setActiveQuestion(activeQuestion === questionId ? null : questionId);
  };

  const toggleFaqSection = () => {
    setIsFaqOpen(!isFaqOpen);
  };

  return (
    <div className={`faq-wrapper ${isVisible ? 'faq-slide-in' : ''}`}>
      <div className="faq-container">
        <div className="faq-header" onClick={toggleFaqSection}>
          <h2 className="faq-title">
            Frequently Asked Questions
            <div className={`faq-section-icon ${isFaqOpen ? 'rotated' : ''}`}>
              <FaChevronDown />
            </div>
          </h2>
          <p className="faq-subtitle">Everything you need to know about Campus Deals</p>
        </div>

        <div className={`faq-content ${isFaqOpen ? 'expanded' : ''}`}>
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <div
                key={faq.id}
                className={`faq-item ${activeQuestion === faq.id ? 'active' : ''} ${isVisible ? 'faq-item-slide-in' : ''}`}
                style={{ 
                  animationDelay: `${0.8 + (index * 0.15)}s`,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-100px)'
                }}
              >
                <div 
                  className="faq-question" 
                  onClick={() => toggleQuestion(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  <div className={`faq-icon ${activeQuestion === faq.id ? 'rotated' : ''}`}>
                    <FaChevronDown />
                  </div>
                </div>

                <div className={`faq-answer ${activeQuestion === faq.id ? 'expanded' : ''}`}>
                  <div className="faq-answer-content">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;