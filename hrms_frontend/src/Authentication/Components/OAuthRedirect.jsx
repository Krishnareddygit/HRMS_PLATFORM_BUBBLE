import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OAuthRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/oauth/error?reason=missing_token', { replace: true });
      return;
    }

    loginWithToken(token).then((result) => {
      if (!result.success) {
        navigate('/oauth/error?reason=oauth_failed', { replace: true });
        return;
      }

      const role = result.user?.role?.toUpperCase();
      setMessage('Login successful! Redirecting...');

      setTimeout(() => {
        if (role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'HR') {
          navigate('/hr/dashboard', { replace: true });
        } else if (role === 'EMPLOYEE') {
          navigate('/employee/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 800);
    });
  }, [location.search, loginWithToken, navigate]);

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <div className="fw-semibold">{message}</div>
      </div>
    </div>
  );
}
