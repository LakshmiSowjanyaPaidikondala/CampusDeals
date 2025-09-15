import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaPlusCircle,
  FaQuestionCircle,
  FaLightbulb,
  FaChevronDown,
} from "react-icons/fa";
import "./Home.css";
import HeroBanner from "../components/HeroBanner";
import "./FAQ.css";
import FAQ from "./faq";
const Home = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  const faqData = [
    {
      id: 1,
      question: "How do I buy items on Campus Deals?",
      answer:
        "Simply browse through available items, click on what interests you, and contact the seller directly through our secure messaging system. All transactions are between students for maximum trust and convenience.",
    },
    {
      id: 2,
      question: "Is it safe to sell my items here?",
      answer:
        "Absolutely! Campus Deals is designed exclusively for verified students. We provide guidelines for safe transactions, meeting recommendations, and a rating system to ensure trustworthy exchanges within your campus community.",
    },
    {
      id: 3,
      question: "What can I sell on this platform?",
      answer:
        "You can sell textbooks, electronics, furniture, clothing, study materials, sports equipment, and any other items that would be useful to fellow students. We only restrict illegal or prohibited items.",
    },
    {
      id: 4,
      question: "How do I contact other students?",
      answer:
        "Once you find an item you're interested in, you can message the seller directly through our built-in chat system. This keeps your personal information private while enabling smooth communication.",
    },
    {
      id: 5,
      question: "Are there any fees for using Campus Deals?",
      answer:
        "Campus Deals is completely free for students! There are no listing fees, transaction fees, or membership costs. We believe in supporting the student community with accessible, cost-free services.",
    },
    {
      id: 6,
      question: "How do I verify my student status?",
      answer:
        "During registration, you'll need to provide your student email address and student ID. We verify this information to ensure our platform remains exclusive to the student community for enhanced safety and trust.",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.classList.contains("faq-section")) {
            setFaqVisible(entry.isIntersecting);
          }
          if (entry.target.classList.contains("card-grid")) {
            setCardsVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.1 }
    );

    const faqSection = document.querySelector(".faq-section");
    const cardGrid = document.querySelector(".card-grid");

    if (faqSection) observer.observe(faqSection);
    if (cardGrid) observer.observe(cardGrid);

    return () => {
      if (faqSection) observer.unobserve(faqSection);
      if (cardGrid) observer.unobserve(cardGrid);
    };
  }, []);

  const toggleQuestion = (questionId) => {
    setActiveQuestion(activeQuestion === questionId ? null : questionId);
  };

  return (
    <div className="home">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Cards Section */}
      <div className="home-content">
        <div className={`card-grid ${cardsVisible ? "cards-visible" : ""}`}>
          <Link to="/buy" className="card card-1">
            <div className="card-icon">
              <FaShoppingCart size={32} />
            </div>
            <h3>Buy Now</h3>
            <p className="card-description">
              Discover amazing deals from fellow students
            </p>
            <div className="card-overlay"></div>
          </Link>

          <Link to="/sell" className="card card-2">
            <div className="card-icon">
              <FaPlusCircle size={32} />
            </div>
            <h3>Sell an Item</h3>
            <p className="card-description">
              Turn your unused items into cash
            </p>
            <div className="card-overlay"></div>
          </Link>

          <Link to="/tips" className="card card-3">
            <div className="card-icon">
              <FaLightbulb size={32} />
            </div>
            <h3>Smart Tips</h3>
            <p className="card-description">
              Expert advice for better deals
            </p>
            <div className="card-overlay"></div>
          </Link>

          <Link to="/faqs" className="card card-4">
            <div className="card-icon">
              <FaQuestionCircle size={32} />
            </div>
            <h3>Help Center</h3>
            <p className="card-description">
              Get answers to common questions
            </p>
            <div className="card-overlay"></div>
          </Link>
        </div>
      </div>

      {/* FAQ Section - Full width, separate from buttons */}
      <div className="faq-section-wrapper">
        <FAQ />
      </div>
    </div>
  );
};

export default Home;