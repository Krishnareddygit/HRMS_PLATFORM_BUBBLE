import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaUserPlus,
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaFileAlt,
  FaClock,
  FaClipboardCheck,
  FaShieldAlt,
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({
  user,
  isMobile = false,
  onClose,
  isCollapsed = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user) return [];
    const role = user.role?.toUpperCase();

    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
        { path: '/admin/create-hr', label: 'Create HR', icon: FaUserPlus },
        { path: '/admin/manage-hr', label: 'Manage HRs', icon: FaShieldAlt },
      ];
    }

    if (role === 'HR') {
      return [
        { path: '/hr/dashboard', label: 'Dashboard', icon: FaHome },
        { path: '/hr/create-employee', label: 'Create Employee', icon: FaUserPlus },
        { path: '/hr/manage-employees', label: 'Manage Employees', icon: FaUsers },
        { path: '/hr/documents', label: 'Documents', icon: FaFileAlt },
        { path: '/hr/time', label: 'Time Management', icon: FaClock },
        { path: '/hr/approvals', label: 'Approvals', icon: FaClipboardCheck },
      ];
    }

    if (role === 'EMPLOYEE') {
      return [
        { path: '/employee/dashboard', label: 'Dashboard', icon: FaHome },
        { path: '/employee/profile', label: 'My Profile', icon: FaUser },
        { path: '/employee/documents', label: 'Documents', icon: FaFileAlt },
        { path: '/employee/time', label: 'Time Management', icon: FaClock },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  const dashboardPath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'HR'
      ? '/hr/dashboard'
      : '/employee/dashboard';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Link to={dashboardPath} className="sidebar-brand">
          <div className="brand-icon">B</div>
          <div className="brand-text">
            <div className="brand-title">Bubble</div>
            <div className="brand-sub">HRMS Suite</div>
          </div>
        </Link>

      </div>

      {/* Navigation */}
      <div className="sidebar-section">Navigation</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                isActive(item.path) ? 'active' : ''
              }`}
              data-tooltip={item.label}
              onClick={isMobile ? onClose : undefined}
            >
              <span className="sidebar-icon">
                <Icon />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          data-tooltip="Logout"
        >
          <span className="sidebar-icon">
            <FaSignOutAlt />
          </span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
