import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import axiosInstance from "../../utils/axiosConfig";
import { API_ENDPOINTS } from "../../config/api";

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT, { username: email.trim() });
      setMessage("If the account exists, a reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
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
                  <h2 className="fw-bold mb-1">Forgot Password</h2>
                  <p className="text-muted mb-0">Enter your email to receive a reset link.</p>
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
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
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
