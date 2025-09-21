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
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import FAQ from "../FAQ/FAQ";
import "../FAQ/FAQ.css";
import Contacts from "../../components/Contacts/Contacts";
const Home = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  
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
    <>
    <div className="home">
      {/* Hero Banner */}
      <HeroBanner />

      <div className="home-content">
        <div className="main-sections-container">
          {/* Cards Section */}
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

      </div>
          {/* FAQ Section Wrapper */}
          <FAQ />
    </div>
    {/* Contacts Section Wrapper */}
    <Contacts />
    </>
  );
};

export default Home;