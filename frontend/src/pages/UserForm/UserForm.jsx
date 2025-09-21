import React, { useState } from "react";
import "./UserForm.css";

const BuyForm = ({ cart, onClose }) => {
  const [agreed, setAgreed] = useState(false); // ✅ track checkbox

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>User Details</h2>
        <form>
          <div className="form-row">
            <label>
              Full Name:
              <input type="text" required />
            </label>
            <label>
              Roll Number:
              <input type="text" required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Email:
              <input type="email" required />
            </label>
            <label>
              Phone Number:
              <input type="tel" pattern="[0-9]{10}" required placeholder="10-digit number" />
            </label>
          </div>

          <div className="form-row">
            <label>
              Year:
              <select required>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </label>
            <label>
              Branch:
              <select required>
                <option value="">Select Branch</option>
                <option value="cse">CSE</option>
                <option value="csm">CSM</option>
                <option value="csd">CSD</option>
                <option value="it">IT</option>
                <option value="ece">ECE</option>
                <option value="eee">EEE</option>
                <option value="mech">Mechanical</option>
                <option value="mrb">MRB</option>
                <option value="civil">Civil</option>
                <option value="chem">Chemical</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Section:
              <select required>
                <option value="">Select Section</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
          </div>

          <div className="form-row radio-row">
            <span>Day Scholar / Hosteller:</span>
            <label>
              <input type="radio" name="accommodation" value="day" required /> Day Scholar
            </label>
            <label>
              <input type="radio" name="accommodation" value="hostel" required /> Hosteller
            </label>
          </div>

          {/* 
          🛒 Show Selected Items 
          <div className="cart-summary">
            <h3>Selected Items</h3>
            {cart.map((item) => (
              <p key={item.id}>
                {item.name} × {item.quantity} = ₹{item.price * item.quantity}
              </p>
            ))}
            <strong>
              Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            </strong>
          </div>
          */}

          {/* ✅ Terms checkbox controls submit */}
          <label className="terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />{" "}
            I agree to
            <a 
              href="https://docs.google.com/document/d/1D3i-AaZjnGlKWdeBULW15TCOYlOWZ9RRDX0vZdsel3E/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              >
              Terms and Conditions
            </a>
          </label>

          <button
            type="submit"
            className="submit-button"
            disabled={!agreed} // ✅ Only enabled if checked
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyForm;
