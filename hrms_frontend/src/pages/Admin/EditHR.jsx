import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaEnvelope, FaSave, FaTimes } from 'react-icons/fa';

const HR_ROLE_OPTIONS = [
  { value: 'ROLE_HR_MANAGER', label: 'HR Manager' },
  { value: 'ROLE_HR_OPERATIONS', label: 'HR Operations' },
  { value: 'ROLE_HR_PAYROLL', label: 'HR Payroll' },
  { value: 'ROLE_HR_BP', label: 'HR Business Partner' },
  { value: 'ROLE_TALENT_ACQUISITION', label: 'Talent Acquisition' },
];

const formatRole = (role) => {
  if (!role) return '';
  return role.replace('ROLE_', '').replace(/_/g, ' ');
};

const pickHrRole = (roles) => {
  if (!Array.isArray(roles)) return 'ROLE_HR_OPERATIONS';
  const found = roles.find((r) => r?.startsWith('ROLE_HR') || r === 'ROLE_TALENT_ACQUISITION');
  return found || 'ROLE_HR_OPERATIONS';
};

const EditHR = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingHr, setLoadingHr] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    hrRole: 'ROLE_HR_OPERATIONS',
    enabled: true,
  });

  useEffect(() => {
    const fetchHr = async () => {
      setLoadingHr(true);
      try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.GET_HR_BY_ID}/${id}`);
        const hr = res.data || {};
        setFormData({
          username: hr.username || '',
          hrRole: pickHrRole(hr.roles),
          enabled: typeof hr.enabled === 'boolean' ? hr.enabled : true,
        });
      } catch (error) {
        showToast({ type: 'error', title: 'Load failed', message: error.response?.data?.message || 'Failed to load HR' });
        navigate('/admin/manage-hr');
      } finally {
        setLoadingHr(false);
      }
    };
    fetchHr();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Email/Username is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Invalid email format';
    }
    if (!formData.hrRole) newErrors.hrRole = 'HR role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axiosInstance.put(API_ENDPOINTS.ADMIN.UPDATE_HR, {
        id: Number(id),
        hrRole: formData.hrRole,
        enabled: !!formData.enabled,
      });
      showToast({ type: 'success', title: 'HR updated', message: 'HR updated successfully!' });
      navigate('/admin/manage-hr');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update HR';
      showToast({ type: 'error', title: 'Update failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Edit HR Account</h2>
          <p className="text-muted mb-0">Update HR role and status</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {loadingHr ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-2 mb-0">Loading HR...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Email / Username <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope size={14} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="hr@bubble.com"
                            disabled
                          />
                        </div>
                        {errors.username && <div className="invalid-feedback d-block">{errors.username}</div>}
                        <div className="text-muted small mt-1">Username cannot be changed.</div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          HR Role <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.hrRole ? 'is-invalid' : ''}`}
                          name="hrRole"
                          value={formData.hrRole}
                          onChange={handleChange}
                        >
                          {HR_ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {errors.hrRole && <div className="invalid-feedback d-block">{errors.hrRole}</div>}
                        <div className="text-muted small mt-1">
                          Current role: {formatRole(formData.hrRole)}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="enabledSwitch"
                            name="enabled"
                            checked={!!formData.enabled}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="enabledSwitch">
                            {formData.enabled ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>

                      <div className="col-12 mt-4 d-flex gap-3">
                        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save Changes
                            </>
                          )}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/manage-hr')}>
                          <FaTimes className="me-2" /> Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditHR;
