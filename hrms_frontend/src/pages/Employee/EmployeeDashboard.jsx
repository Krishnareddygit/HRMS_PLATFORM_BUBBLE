import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaBriefcase } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS, API_AUTH_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';


import { useParams } from "react-router-dom";


const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const { id } = useParams();

  const employeeId = id || user?.employeeId;



  useEffect(() => {
    if (employeeId) {
      fetchProfile();
    }
  }, [employeeId]);

  const fetchProfile = async () => {
    try {
      if (!employeeId) {
        throw new Error("Employee id missing");
      }
  
      // 🔵 Profile data
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.EMPLOYEE.PROFILE}/${employeeId}/profile`
      );
  
      const data = response.data || {};
  
      setProfile({
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name,
        email: data.companyEmail || data.email,
        phone: data.phoneNumber || data.phone,
        department: data.department,
        position: data.designation || data.position,
        salary: data.ctc ? `₹${data.ctc}` : data.salary,
      });
  
      // 🔵 PROFILE IMAGE (ADD THIS PART)
      try {
        const imgRes = await axiosInstance.get(
          `${API_AUTH_BASE_URL}/api/profile-images/${employeeId}`
        );
  
        setProfileImageUrl(
          typeof imgRes.data === "string"
            ? imgRes.data
            : imgRes.data?.url || null
        );
      } catch {
        setProfileImageUrl(null);
      }
  
    } catch (error) {
      console.error('Error fetching profile:', error);
  
      setProfile({
        name: user?.name || 'Employee Name',
        email: user?.email || 'employee@bubble.com',
        phone: '+1 234 567 8900',
        department: 'Engineering',
        position: 'Software Engineer',
        salary: '$75,000',
      });
  
      // fallback image
      setProfileImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    { label: 'Name', value: profile?.name, icon: FaUser, iconClass: 'text-primary', bgClass: 'bg-primary-subtle' },
    { label: 'Email', value: profile?.email, icon: FaEnvelope, iconClass: 'text-info', bgClass: 'bg-info-subtle' },
    { label: 'Phone', value: profile?.phone, icon: FaPhone, iconClass: 'text-success', bgClass: 'bg-success-subtle' },
    { label: 'Department', value: profile?.department, icon: FaBuilding, iconClass: 'text-warning', bgClass: 'bg-warning-subtle' },
    { label: 'Position', value: profile?.position, icon: FaBriefcase, iconClass: 'text-secondary', bgClass: 'bg-secondary-subtle' },
  ];

  return (
    <Layout>
      <div className="container-fluid page-gradient">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h4 className="mb-1">My Dashboard</h4>
            <p className="text-muted mb-0">Welcome back! Here is your information.</p>
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
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Profile Information</h5>
                  <div className="row g-3">
                    {infoCards.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="col-md-6">
                          <div className="d-flex align-items-center gap-3">
                            <div className={`rounded-circle p-3 ${item.bgClass}`}>
                              <Icon className={item.iconClass} />
                            </div>
                            <div>
                              <div className="text-muted small">{item.label}</div>
                              <div className="fw-semibold">{item.value || '-'}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center d-flex flex-column">
                  <div
  className="rounded-circle overflow-hidden mx-auto mb-3"
  style={{ width: 90, height: 90 }}
>
  {profileImageUrl ? (
    <img
      src={profileImageUrl}
      alt="Profile"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div className="bg-primary text-white fw-bold d-flex align-items-center justify-content-center w-100 h-100 fs-2">
      {profile?.name?.charAt(0) || "E"}
    </div>
  )}
</div>
                  <h5 className="fw-bold mb-1">{profile?.name}</h5>
                  <p className="text-muted mb-3">{profile?.position}</p>
                  <Link to="/employee/profile" className="btn btn-primary mt-auto">
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;


