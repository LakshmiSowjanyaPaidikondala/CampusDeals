import React from "react";
import "./HeroBanner.css";
import banner from "../assets/banner.jpg"; // replace with your banner image

const HeroBanner = () => {
  return (
    <section className="hero-banner">
      <img src={banner} alt="Campus Deals Banner" className="banner-img" />
    </section>
  );
};

export default HeroBanner;
