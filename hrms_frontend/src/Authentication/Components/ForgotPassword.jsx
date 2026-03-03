import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaLock, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import axiosInstance from "../../utils/axiosConfig";
import { API_ENDPOINTS } from "../../config/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.RESET, {
        token,
        newPassword: formData.newPassword,
      });
      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { state: { message: "Password updated successfully. Please sign in." } });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <h2 className="fw-bold mb-1">Reset Password</h2>
                  <p className="text-muted mb-0">Enter your new password below.</p>
                </div>

                {message && (
                  <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                    <FaCheckCircle /> <span>{message}</span>
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <FaExclamationCircle /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        id="newPassword"
                        type="password"
                        name="newPassword"
                        className="form-control"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-decoration-none">
                    <FaArrowLeft className="me-1" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
