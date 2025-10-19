import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Buy from "./pages/Buy/Buy";
import Sell from "./pages/Sell/Sell";
import Cart from "./pages/Cart/cart.jsx";
import TipsX from "./pages/Tips/TipsX";
import Login from "./pages/Login_Register/Login";
import Register from "./pages/Login_Register/Register";
import Profile from "./pages/Profile/Profile";
import Orders from "./pages/Orders/Orders";
import Settings from "./pages/Settings/Settings";
import Footer from "./components/Footer/Footer";
import HeroBanner from "./components/HeroBanner/HeroBanner";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import logo from "./assets/logo.png";


const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            {/* Logo at top */}
            
            <ScrollToTop /> 
            {/* Navbar */}
            <Navbar />

           

            {/* Pages */}
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/tips" element={<TipsX />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
              </Routes>
            </ErrorBoundary>

            {/* Footer */}
            <Footer />
            {/* <ScrollToTop /> */}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
