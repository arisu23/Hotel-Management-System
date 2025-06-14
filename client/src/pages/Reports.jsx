import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMonthlyIncome();
  }, []);

  const fetchMonthlyIncome = async () => {
    try {
      const response = await axios.get("/api/reports/monthly-income");
      setMonthlyData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch monthly income data");
      setLoading(false);
    }
  };

  const chartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: "Monthly Income ($)",
        data: monthlyData.map(item => parseFloat(item.total) || 0),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Income Report",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return "$" + value.toFixed(2);
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Financial Reports</h2>
      
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-12">
              <div style={{ height: "400px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.month}</td>
                        <td>${(parseFloat(item.total) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 