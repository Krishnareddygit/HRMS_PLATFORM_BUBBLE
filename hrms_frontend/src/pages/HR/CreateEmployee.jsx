import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateEmployee = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    employeeType: 'FULL_TIME',
    currentBand: '',
    currentExperience: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    subBusinessUnit: '',
    currentOfficeLocation: '',
    managerId: '',
  });
  // const [showPassword, setShowPassword] = useState(false);
  // const [managers, setManagers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.HR.GET_ALL_EMPLOYEES);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setManagers(list);
    } catch (error) {
      setManagers([]);
    }
  };

  React.useEffect(() => {
    fetchManagers();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z\s]+$/;

if (!formData.firstName.trim()) {
  newErrors.firstName = 'First name is required';
} else if (!nameRegex.test(formData.firstName)) {
  newErrors.firstName = 'First name should contain only letters';
}

if (!formData.lastName.trim()) {
  newErrors.lastName = 'Last name is required';
} else if (!nameRegex.test(formData.lastName)) {
  newErrors.lastName = 'Last name should contain only letters';
}
    
    if (!formData.personalEmail.trim()) {
      newErrors.personalEmail = 'Personal email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.salary || formData.salary <= 10000) newErrors.salary = 'Valid salary is required';


    if (!formData.currentExperience || formData.currentExperience < 0)
  newErrors.currentExperience = 'Valid experience required';

  if (!formData.subBusinessUnit.trim())
  newErrors.subBusinessUnit = 'Sub Business Unit required';

  if (formData.managerId && isNaN(formData.managerId)) {
    newErrors.managerId = "Manager ID must be a number";
  }

if (!formData.currentOfficeLocation.trim())
  newErrors.currentOfficeLocation = 'Office location required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const phoneNum = parseInt(String(formData.phone).replace(/\D/g, ''), 10) || 0;
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        designation: formData.designation,
        employeeType: formData.employeeType,
        dateOfJoining: formData.dateOfJoining,
        currentBand: formData.currentBand,
        currentExperience: parseFloat(formData.currentExperience) || 0,
        ctc: parseInt(formData.salary, 10) || 0,
        phoneNumber: parseInt(String(formData.phone).replace(/\D/g, ''), 10) || 0,
        personalEmail: formData.personalEmail,
      
        subBusinessUnit: formData.subBusinessUnit,
        currentOfficeLocation: formData.currentOfficeLocation,
        managerId: formData.managerId
        ? parseInt(formData.managerId, 10)
        : 0,      
      };
      const res = await axiosInstance.post(API_ENDPOINTS.HR.CREATE_EMPLOYEE, payload);
      const creds = res.data;
      const msg = creds?.tempPassword
        ? `Employee created. Login: ${creds.username}. Temporary password: ${creds.tempPassword} (share securely with employee)`
        : 'Employee created successfully!';
      showToast({ type: 'success', title: 'Employee created', message: msg });
      navigate('/hr/manage-employees');
    } catch (error) {
      const data = error.response?.data;
      const msg =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        (error.response?.status === 403 && 'You do not have permission to create employees.') ||
        (error.response?.status === 401 && 'Please log in again.') ||
        (error.response?.status === 400 && (data?.message || 'Invalid request. Check the form (e.g. company email may already be in use).')) ||
        'Failed to create employee. Try again or contact support.';
      showToast({ type: 'error', title: 'Create failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid page-gradient">
        <div className="mb-4">
          <h2 className="fw-bold">Create Employee</h2>
          <p className="text-muted mb-0">Add a new employee and generate login credentials</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                        />
                      </div>
                      {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                        />
                      </div>
                      {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                    </div>



                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Personal Email <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope size={14} className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.personalEmail ? 'is-invalid' : ''}`}
                          name="personalEmail"
                          value={formData.personalEmail}
                          onChange={handleChange}
                          placeholder="employee@gmail.com"
                        />
                      </div>
                      {errors.personalEmail && <div className="invalid-feedback d-block">{errors.personalEmail}</div>}
                    </div>


                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaPhone size={14} className="text-muted" />
                        </span>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
  <label className="form-label fw-semibold">
    Experience (Years)
  </label>
  <input
    type="number"
    step="0.1"
    className={`form-control ${errors.currentExperience ? 'is-invalid' : ''}`}
    name="currentExperience"
    value={formData.currentExperience}
    onChange={handleChange}
    placeholder="0.1"
  />
  {errors.currentExperience && (
    <div className="invalid-feedback d-block">
      {errors.currentExperience}
    </div>
  )}
</div>


                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Department <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaBuilding size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="Engineering"
                        />
                      </div>
                      {errors.department && <div className="invalid-feedback d-block">{errors.department}</div>}
                    </div>

                    <div className="col-md-6">
  <label className="form-label fw-semibold">
    Sub Business Unit
  </label>
  <input
    type="text"
    className={`form-control ${errors.subBusinessUnit ? 'is-invalid' : ''}`}
    name="subBusinessUnit"
    value={formData.subBusinessUnit}
    onChange={handleChange}
    placeholder="e.g. Digital Engineering"
  />
  {errors.subBusinessUnit && (
    <div className="invalid-feedback d-block">
      {errors.subBusinessUnit}
    </div>
  )}
</div>

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
                        placeholder="Software Engineer"
                      />
                      {errors.designation && <div className="invalid-feedback d-block">{errors.designation}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Employee Type</label>
                      <select className="form-select" name="employeeType" value={formData.employeeType} onChange={handleChange}>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Band</label>
                      <select className="form-select" name="currentBand" value={formData.currentBand} onChange={handleChange}>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="B3">B3</option>
                        <option value="B4">B4</option>
                        <option value="B5">B5</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Date of Joining</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
  <label className="form-label fw-semibold">
    Office Location
  </label>
  <input
    type="text"
    className={`form-control ${errors.currentOfficeLocation ? 'is-invalid' : ''}`}
    name="currentOfficeLocation"
    value={formData.currentOfficeLocation}
    onChange={handleChange}
    placeholder="Chennai"
  />
  {errors.currentOfficeLocation && (
    <div className="invalid-feedback d-block">
      {errors.currentOfficeLocation}
    </div>
  )}
</div>

<div className="col-md-6">
  <label className="form-label fw-semibold">
    Manager ID
  </label>
  <input
    type="number"
    className="form-control"
    name="managerId"
    value={formData.managerId}
    onChange={handleChange}
    placeholder="Enter manager employee ID"
  />
</div>



                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Salary (CTC) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="50000"
                      />
                      {errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
                    </div>

                    <div className="col-12 mt-4 d-flex gap-3">
                      <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <FaSave /> Create Employee
                          </>
                        )}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/hr/dashboard')}>
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

export default CreateEmployee;