import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaEnvelope, FaLock, FaSave, FaTimes } from 'react-icons/fa';

const CreateHR = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    role: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    personalEmail: '',
    currentBand: '',
    currentExperience: '',
    salary: '',
    phone: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.department.trim()) newErrors.department = 'Department required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation required';
  
    if (!formData.personalEmail.trim())
      newErrors.personalEmail = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail))
      newErrors.personalEmail = 'Invalid email';
  
    if (!formData.currentExperience || formData.currentExperience < 0)
      newErrors.currentExperience = 'Valid experience required';
  
    if (!formData.salary || formData.salary <= 0)
      newErrors.salary = 'Valid salary required';
  
    if (!formData.phone) newErrors.phone = 'Phone required';
  
    // ⭐ IMPORTANT
    setErrors(newErrors);
  
    // ⭐ return validation result
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADMIN.CREATE_HR, {
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        designation: formData.designation,
        personalEmail: formData.personalEmail,
        currentBand: formData.currentBand,
        currentExperience: parseFloat(formData.currentExperience) || 0,
        ctc: parseInt(formData.salary, 10) || 0,
        phoneNumber: parseInt(String(formData.phone).replace(/\D/g, ''), 10) || 0,
        dateOfJoining: formData.dateOfJoining,
      });
      showToast({ type: 'success', title: 'HR created', message: 'HR created successfully!' });
      navigate('/admin/manage-hr');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create HR';
      showToast({ type: 'error', title: 'Create failed', message: msg });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Create HR</h2>
          <p className="text-muted mb-0">Add a new HR employee</p>
        </div>
  
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
  
                    {/* FIRST NAME */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                    </div>
  
                    {/* LAST NAME */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                    </div>
  
                    {/* PERSONAL EMAIL */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Personal Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.personalEmail ? 'is-invalid' : ''}`}
                        name="personalEmail"
                        value={formData.personalEmail}
                        onChange={handleChange}
                      />
                      {errors.personalEmail && <div className="invalid-feedback d-block">{errors.personalEmail}</div>}
                    </div>
  
                    {/* PHONE */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </div>
  
                    {/* DEPARTMENT */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Department <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                      {errors.department && <div className="invalid-feedback d-block">{errors.department}</div>}
                    </div>
  
                    {/* DESIGNATION */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Designation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                      {errors.designation && <div className="invalid-feedback d-block">{errors.designation}</div>}
                    </div>
  
                    {/* ROLE */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Role</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="ROLE_HR_OPERATIONS">HR Operations</option>
                        <option value="ROLE_HR_PAYROLL">HR Payroll</option>
                        <option value="ROLE_HR_BP">HR Business Partner</option>
                        <option value="ROLE_TALENT_ACQUISITION">Talent Acquisition</option>
                        <option value="ROLE_HR_MANAGER">HR Manager</option>
                      </select>
                    </div>
  
                    {/* BAND */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Current Band</label>
                      <input
                        type="text"
                        className="form-control"
                        name="currentBand"
                        value={formData.currentBand}
                        onChange={handleChange}
                      />
                    </div>
  
                    {/* EXPERIENCE */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Experience (Years)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${errors.currentExperience ? 'is-invalid' : ''}`}
                        name="currentExperience"
                        value={formData.currentExperience}
                        onChange={handleChange}
                      />
                      {errors.currentExperience && (
                        <div className="invalid-feedback d-block">{errors.currentExperience}</div>
                      )}
                    </div>
  
                    {/* SALARY */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Salary (CTC) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                      />
                      {errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
                    </div>
  
                    {/* DOJ */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date of Joining</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleChange}
                      />
                    </div>
  
                    {/* BUTTONS */}
                    <div className="col-12 mt-4 d-flex gap-3">
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <FaSave /> Create HR
                          </>
                        )}
                      </button>
  
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/admin/dashboard')}
                      >
                        <FaTimes className="me-2" /> Cancel
                      </button>
                    </div>
  
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateHR;
