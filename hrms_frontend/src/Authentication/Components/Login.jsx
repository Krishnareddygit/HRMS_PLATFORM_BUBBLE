import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_AUTH_BASE_URL, API_BASE_URL } from "../../config/api";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaGoogle,
  FaMobileAlt,
} from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrStatus, setQrStatus] = useState("idle");
  const [qrError, setQrError] = useState("");
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [showQrPrompt, setShowQrPrompt] = useState(false);
  const qrRefreshMs = 60000;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (!error) return;
    const messageByReason = {
      missing_email: "Your Google account did not provide an email address.",
      not_registered: "This email is not registered. Please contact Admin or HR.",
      missing_token: "OAuth token was not received. Please try again.",
      oauth_failed: "OAuth login failed. Please try again.",
      oauth_failure: "OAuth login failed. Please try again.",
    };
    setErrorMessage(messageByReason[error] || "Login failed. Please try again.");
  }, [location.search]);

  const redirectByRole = useCallback((roleRaw) => {
    const role = roleRaw?.toUpperCase();
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (role === "HR") {
      navigate("/hr/dashboard");
    } else if (role === "EMPLOYEE") {
      navigate("/employee/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setErrorMessage("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccessMessage("Login successful! Redirecting...");
        setFormData({ email: "", password: "", rememberMe: false });

        setTimeout(() => {
          redirectByRole(result.user?.role);
        }, 1500);
      } else {
        setErrorMessage(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_AUTH_BASE_URL}/oauth2/authorization/google`;
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/request-password");
  };

  const generateQrCode = useCallback(() => {
    const code = `QR-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setQrCode(code);
    setQrImageUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=260x260&ecc=H&margin=2&data=${encodeURIComponent(code)}`
    );
    setQrStatus("waiting");
    setQrError("");
    setQrExpiresAt(Date.now() + 2 * 60 * 1000);
  }, []);

  const openQrPrompt = () => {
    setShowQrPrompt(true);
    generateQrCode();
  };

  const closeQrPrompt = () => {
    setShowQrPrompt(false);
    setQrStatus("idle");
    setQrError("");
  };

  useEffect(() => {
    if (!showQrPrompt) return undefined;
    const interval = setInterval(generateQrCode, qrRefreshMs);
    return () => clearInterval(interval);
  }, [showQrPrompt, generateQrCode]);

  useEffect(() => {
    if (!showQrPrompt || !qrCode) return undefined;

    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      if (qrExpiresAt && Date.now() > qrExpiresAt) {
        setQrStatus("expired");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/qr/status?code=${encodeURIComponent(qrCode)}`,
          { headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) return;

        const data = await response.json().catch(() => ({}));
        const token = data?.token || data?.accessToken || data?.jwt;
        const status = (data?.status || data?.state || "").toLowerCase();

        if (token) {
          const result = await loginWithToken(token);
          if (result.success) {
            setQrStatus("approved");
            setQrError("");
            redirectByRole(result.user?.role);
            return;
          }
          setQrError(result.error || "QR login failed. Please try again.");
          setQrStatus("error");
          return;
        }

        if (status === "approved" || status === "confirmed") {
          setQrStatus("approved");
        } else if (status === "expired") {
          setQrStatus("expired");
        } else if (status === "rejected") {
          setQrStatus("rejected");
        } else {
          setQrStatus("waiting");
        }
      } catch (error) {
        setQrError("Unable to reach the server for QR login.");
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [qrCode, qrExpiresAt, loginWithToken, redirectByRole, showQrPrompt]);

  return (
    <div className="container-fluid vw-100 vh-100 p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-22px) scale(1.03); }
        }
        .login-visual {
          background: radial-gradient(1200px circle at 20% 20%, #7b2cbf 0%, #5a189a 45%, #240046 100%);
          position: relative;
          overflow: hidden;
        }
        .login-visual::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(800px circle at 80% 20%, rgba(255,255,255,0.08), transparent 60%);
        }
        .bubble {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.12));
          box-shadow:
            inset -10px -10px 22px rgba(0,0,0,0.25),
            inset 12px 12px 26px rgba(255,255,255,0.18),
            0 20px 45px rgba(0,0,0,0.25);
          backdrop-filter: blur(2px);
          animation: float 10s ease-in-out infinite;
        }
        .bubble::after {
          content: "";
          position: absolute;
          top: 18%;
          left: 20%;
          width: 28%;
          height: 28%;
          border-radius: 999px;
          background: rgba(255,255,255,0.45);
          filter: blur(1px);
        }
        .bubble::before {
          content: "";
          position: absolute;
          bottom: 18%;
          right: 22%;
          width: 16%;
          height: 16%;
          border-radius: 999px;
          background: rgba(255,255,255,0.25);
          filter: blur(1px);
        }
        .login-card {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          backdrop-filter: blur(10px);
        }
        .login-panel {
          position: relative;
          overflow: hidden;
        }
        .login-panel .bubble {
          opacity: 0.6;
        }
        .btn-hero {
          background: linear-gradient(135deg, #7b2cbf 0%, #5a189a 45%, #3c096c 100%);
          border: 0;
          box-shadow: 0 12px 24px rgba(90, 24, 154, 0.35);
        }
        .btn-hero:hover {
          filter: brightness(1.05);
        }
        .form-control:focus, .form-check-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(123, 44, 191, 0.2);
          border-color: #7b2cbf;
        }
        .login-title {
          font-family: "Roboto", sans-serif;
          font-size: 24px;
          color: #2A333E;
          margin: 0 0 20px 0;
          font-weight: 400;
        }
        .qr-panel {
          border: 1px solid rgba(42, 51, 62, 0.15);
          border-radius: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.7);
        }
        .qr-code {
          border: 1px solid rgba(42, 51, 62, 0.2);
          border-radius: 12px;
          padding: 8px;
          background: #fff;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
        }
        .qr-status.waiting {
          background: rgba(123, 44, 191, 0.12);
          color: #5a189a;
        }
        .qr-status.approved {
          background: rgba(16, 185, 129, 0.15);
          color: #0f766e;
        }
        .qr-status.expired,
        .qr-status.rejected,
        .qr-status.error {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }
        .qr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
          backdrop-filter: blur(6px);
        }
        .qr-modal {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 22px;
          padding: 22px;
          width: min(560px, 92vw);
          box-shadow: 0 35px 70px rgba(15, 23, 42, 0.25);
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
        .qr-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .qr-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        .qr-modal-subtitle {
          color: #6b7280;
          font-size: 13px;
        }
      `}</style>
      <div className="row vh-100 g-0">
        <div className="col-lg-8 d-none d-lg-flex align-items-center justify-content-center text-white login-visual">
          <div className="text-center px-4 position-relative" style={{ zIndex: 2, maxWidth: 560 }}>
            <div className="text-uppercase small mb-3 fw-semibold opacity-75">HRMS Platform</div>
            <h1 className="display-4 fw-bold mb-3">Bubble</h1>
            <p className="lead mb-4">A smarter, calmer workspace for people operations.</p>
            <div className="d-flex justify-content-center gap-3">
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Secure Access</div>
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Role Based</div>
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Always On</div>
            </div>
          </div>
          <div className="bubble" style={{ width: 260, height: 260, top: "8%", left: "6%" }} />
          <div className="bubble" style={{ width: 140, height: 140, bottom: "10%", left: "16%", animationDelay: "-2s" }} />
          <div className="bubble" style={{ width: 320, height: 320, top: "18%", right: "6%", animationDelay: "-4s" }} />
          <div className="bubble" style={{ width: 180, height: 180, bottom: "18%", right: "20%", animationDelay: "-6s" }} />
          <div className="bubble" style={{ width: 110, height: 110, top: "55%", left: "10%", animationDelay: "-3s" }} />
          <div className="bubble" style={{ width: 80, height: 80, top: "30%", left: "48%", animationDelay: "-5s" }} />
          <div className="bubble" style={{ width: 90, height: 90, bottom: "28%", left: "40%", animationDelay: "-7s" }} />
        </div>

        <div
          className="col-12 col-lg-4 d-flex align-items-center login-panel"
          style={{ background: "linear-gradient(180deg, #f7f0ff 0%, #efe3ff 100%)" }}
        >
          <div
            className="card border-0 shadow-lg login-card position-relative ms-lg-auto me-lg-3"
            style={{ zIndex: 2, width: "min(420px, 90%)" }}
          >
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="login-title mb-1">Sign In</h2>
                <p className="text-muted mb-0">Welcome back! Please enter your details.</p>
              </div>

              {successMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                  <FaCheckCircle /> <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <FaExclamationCircle /> <span>{errorMessage}</span>
                </div>
              )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="john.doe@bubble.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label mb-0">
                      Password
                    </label>
                    <button type="button" className="btn btn-link p-0" onClick={handleForgotPassword}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>

                <button type="submit" className="btn btn-hero text-white w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue <FaArrowRight className="ms-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center my-4">
                <span className="text-muted small text-uppercase">Secure Login</span>
              </div>

              <div className="d-grid gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle />
                  Sign in with Google
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={openQrPrompt}
                >
                  <FaMobileAlt />
                  Sign in with Mobile
                </button>
              </div>
            </div>
          </div>
          <div className="bubble" style={{ width: 180, height: 180, top: "8%", right: "12%", animationDelay: "-3s" }} />
          <div className="bubble" style={{ width: 120, height: 120, bottom: "12%", right: "18%", animationDelay: "-5s" }} />
          <div className="bubble" style={{ width: 90, height: 90, top: "55%", right: "30%", animationDelay: "-7s" }} />
        </div>
      </div>
      {showQrPrompt && (
        <div className="qr-overlay" onClick={closeQrPrompt}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header mb-2">
              <div>
                <div className="qr-modal-title">Sign in with Mobile</div>
                <div className="qr-modal-subtitle">Scan the code in the mobile app. It refreshes every minute.</div>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeQrPrompt}>
                Close
              </button>
            </div>
            <div className="d-flex flex-column flex-md-row gap-3 mt-3 align-items-center align-items-md-start">
              <div className="qr-code">
                {qrImageUrl ? (
                  <img src={qrImageUrl} alt="QR login code" width="240" height="240" style={{ display: "block" }} />
                ) : (
                  <div className="text-muted small">Generating...</div>
                )}
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small">Code</div>
                <div className="font-monospace fw-semibold">{qrCode || "—"}</div>
                <div className={`qr-status ${qrStatus} mt-2`}>
                  {qrStatus === "approved"
                    ? "Approved"
                    : qrStatus === "expired"
                    ? "Expired"
                    : qrStatus === "rejected"
                    ? "Rejected"
                    : qrStatus === "error"
                    ? "Error"
                    : "Waiting for scan"}
                </div>
                {qrExpiresAt && (
                  <div className="text-muted small mt-2">
                    Expires in {Math.max(0, Math.ceil((qrExpiresAt - Date.now()) / 1000))}s
                  </div>
                )}
                {qrError && <div className="text-danger small mt-2">{qrError}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
