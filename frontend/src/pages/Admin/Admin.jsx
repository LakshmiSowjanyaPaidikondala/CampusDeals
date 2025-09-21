// src/pages/Admin.jsx
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import "./Admin.css";

// Register chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
);

const Admin = () => {
  // Dummy Data
  const buyersData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Buyers",
        data: [12, 19, 8, 15],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const sellersData = {
    labels: ["Electronics", "Books", "Clothing", "Others"],
    datasets: [
      {
        label: "Sellers",
        data: [10, 7, 12, 5],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
      },
    ],
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="charts-container">
        <div className="chart-card">
          <h2>Buyer Activity</h2>
          <Bar data={buyersData} />
        </div>
        <div className="chart-card">
          <h2>Seller Distribution</h2>
          <Doughnut data={sellersData} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
