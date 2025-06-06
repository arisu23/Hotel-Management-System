import React from 'react';

const Reports = () => {
  return (
    <div className="container">
      <h2>Reports</h2>
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Booking Statistics</h5>
              <p className="card-text">View booking statistics and trends.</p>
              <button className="btn btn-primary">View Report</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Reports</h5>
              <p className="card-text">View revenue and financial reports.</p>
              <button className="btn btn-primary">View Report</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Room Occupancy</h5>
              <p className="card-text">View room occupancy rates and trends.</p>
              <button className="btn btn-primary">View Report</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Customer Analytics</h5>
              <p className="card-text">View customer demographics and preferences.</p>
              <button className="btn btn-primary">View Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 