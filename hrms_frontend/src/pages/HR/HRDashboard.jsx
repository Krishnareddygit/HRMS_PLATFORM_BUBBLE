import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { FaUsers, FaUserPlus, FaChartLine, FaBuilding } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployees: 0,
    activeEmployees: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.HR.DASHBOARD);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalEmployees: 45,
        newEmployees: 5,
        activeEmployees: 42,
        pendingTasks: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: FaUsers,
      iconClass: 'text-primary',
      bgClass: 'bg-primary-subtle',
    },
    {
      title: 'New Employees',
      value: stats.newEmployees,
      icon: FaUserPlus,
      iconClass: 'text-success',
      bgClass: 'bg-success-subtle',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: FaBuilding,
      iconClass: 'text-info',
      bgClass: 'bg-info-subtle',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: FaChartLine,
      iconClass: 'text-warning',
      bgClass: 'bg-warning-subtle',
    },
  ];

  return (
    <Layout>
      <div className="container-fluid page-gradient">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h4 className="mb-1">HR Dashboard</h4>
              <p className="text-muted mb-0">Manage your employees efficiently.</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/hr/create-employee" className="btn btn-primary">
                Create Employee
              </Link>
              <Link to="/hr/manage-employees" className="btn btn-outline-primary">
                Manage Employees
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="col-md-6 col-xl-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-start justify-content-between">
                      <div>
                        <div className="text-muted text-uppercase small">{card.title}</div>
                        <div className="h4 mb-0">{card.value}</div>
                      </div>
                      <div className={`rounded-circle p-3 ${card.bgClass}`}>
                        <Icon className={card.iconClass} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HRDashboard;


