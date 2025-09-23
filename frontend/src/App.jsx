import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Buy from "./pages/Buy/Buy";
import Sell from "./pages/Sell/Sell";
import TipsX from "./pages/Tips/TipsX";
import Login from "./pages/Login_Register/Login";
import Register from "./pages/Login_Register/Register";
import Footer from "./components/Footer/Footer";
import HeroBanner from "./components/HeroBanner/HeroBanner";
// import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import logo from "./assets/logo.png";


const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Logo at top */}
        

        {/* Navbar */}
        <Navbar />

       

        {/* Pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/tips" element={<TipsX />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        {/* Footer */}
        <Footer />
        {/* <ScrollToTop /> */}
      </div>
    </Router>
  );
};

export default App;
