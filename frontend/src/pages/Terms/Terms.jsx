import React from 'react';
import './Terms.css';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <div className="terms-container">
        

        <div className="terms-header">
          <div className="terms-header-content">
            <h1>Terms & Conditions</h1>
            <p>Please read our terms carefully</p>
          </div>
          <div className="terms-icon-wrapper">
            <FaFileContract className="terms-icon" />
          </div>
        </div>

        <div className="terms-content-wrapper">
          <div className="terms-section">
            <h2 className="terms-subtitle">📦 For Sellers</h2>
            <div className="terms-content">
              <p className="terms-intro">By giving the item to Team CampusDeals, the seller is bound by the following directives:</p>
              <ul className="terms-list">
                <li>The seller has <strong>no right to take the item back</strong>. Under any circumstances if he/she wants to take their item, they must pay a compensation of <strong>15% of the product's cost</strong>.</li>
                <li>The seller will get their money <strong>after the sale</strong> of their product and will be handed over in accordance with the return policies of the company.</li>
                <li>Seller must provide their <strong>ROLL-NUMBER</strong> or any valid proof (temporary ID Card, Aadhar card) during collection of the item.</li>
                <li>It is assured that <strong>your information is safe and secured</strong>.</li>
                <li>The product undergoes <strong>quality checks</strong> to maintain standards. If qualified, the item will be listed on our website.</li>
                <li>Seller will be funded with the <strong>marketing price</strong> of the product if the product is damaged.</li>
              </ul>
            </div>
          </div>

          <div className="terms-divider"></div>

          <div className="terms-section">
            <h2 className="terms-subtitle">🛒 For Buyers</h2>
            <div className="terms-content">
              <p className="terms-intro">There is a return policy for 3 days for all items. Please check items carefully before purchase.</p>
              <ul className="terms-list">
                <li>There is a <strong>return policy for 3 days</strong> for all items.</li>
                <li>Items need to be <strong>thoroughly checked</strong> by the customer before buying.</li>
                <li>Team CampusDeals is <strong>not responsible for any damage</strong> after the product has been sold.</li>
                <li>Buyer must provide their <strong>ROLL-NUMBER</strong> or any valid proof (temporary ID Card, Aadhar card) during purchase of the item.</li>
                <li>It is assured that <strong>your information is safe and secured</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
