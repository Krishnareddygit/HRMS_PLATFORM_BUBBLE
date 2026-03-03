import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const messageByReason = {
  missing_email: 'Your Google account did not provide an email address.',
  not_registered: 'This email is not registered. Please contact Admin or HR.',
  missing_token: 'OAuth token was not received. Please try again.',
  oauth_failed: 'OAuth login failed. Please try again.',
  oauth_failure: 'OAuth login failed. Please try again.',
};

export default function OAuthError() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const reason = params.get('reason') || 'oauth_failed';
  const message = messageByReason[reason] || 'Login failed. Please try again.';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/login?error=${encodeURIComponent(reason)}`, { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, reason]);

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <h2 className="fw-bold mb-2">Sign-in error</h2>
        <p className="text-muted mb-4">{message}</p>
        <div className="small text-muted">Redirecting to login…</div>
      </div>
    </div>
  );
}
