import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const normalizedRole = user?.role?.replace("ROLE_", "").toUpperCase();

if (allowedRoles.length > 0 && user && !allowedRoles.includes(normalizedRole)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      ADMIN: '/admin/dashboard',
      HR: '/hr/dashboard',
      EMPLOYEE: '/employee/dashboard',
    };
    
    return <Navigate to={roleRoutes[normalizedRole] || "/login"} replace />;;
  }

  return children;
};

export default ProtectedRoute;
