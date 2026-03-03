import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaSave, FaTimes } from 'react-icons/fa';

const EditEmployee = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyEmail: '',
    phone: '',
    department: '',
    designation: '',
    status: 'ACTIVE',
    employeeType: 'FULL_TIME',
    currentBand: 'B1',
    dateOfJoining: '',
    salary: '',
    currentExperience: 0,
  
    subBusinessUnit: '',
    currentOfficeLocation: '',
    managerId: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoadingEmployee(true);
      try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.HR.GET_EMPLOYEE_BY_ID}/${id}`);
        const emp = res.data || {};
        setFormData({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          companyEmail: emp.companyEmail || '',
          phone: emp.phoneNumber ? String(emp.phoneNumber) : '',
          department: emp.department || '',
          designation: emp.designation || '',
          status: emp.status || 'ACTIVE',
          employeeType: emp.employeeType || 'FULL_TIME',
          currentBand: emp.currentBand || 'B1',
          dateOfJoining: emp.dateOfJoining || '',
          salary: emp.ctc != null ? String(emp.ctc) : '',
          currentExperience: emp.currentExperience ?? 0,
        
          subBusinessUnit: emp.subBusinessUnit || '',
          currentOfficeLocation: emp.currentOfficeLocation || '',
          managerId: emp.managerId || '',
        });
      } catch (error) {
        showToast({ type: 'error', title: 'Load failed', message: error.response?.data?.message || 'Failed to load employee' });
        navigate('/hr/manage-employees');
      } finally {
        setLoadingEmployee(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.salary || Number(formData.salary) <= 0) newErrors.salary = 'Valid salary is required';

    if (!formData.subBusinessUnit.trim())
  newErrors.subBusinessUnit = "Sub business unit required";

if (!formData.currentOfficeLocation.trim())
  newErrors.currentOfficeLocation = "Office location required";

if (formData.managerId && isNaN(formData.managerId))
  newErrors.managerId = "Manager ID must be a number";
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
        companyEmail: formData.companyEmail,
        designation: formData.designation,
        department: formData.department,
        status: formData.status || 'ACTIVE',
        dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        employeeType: formData.employeeType || 'FULL_TIME',
        phoneNumber: phoneNum,
        currentBand: formData.currentBand || 'B1',
        currentExperience: Number(formData.currentExperience) || 0,
        ctc: parseInt(formData.salary, 10) || 0,
      
        subBusinessUnit: formData.subBusinessUnit,
        currentOfficeLocation: formData.currentOfficeLocation,
        managerId: formData.managerId
          ? parseInt(formData.managerId, 10)
          : null,
      };
      await axiosInstance.put(`${API_ENDPOINTS.HR.UPDATE_EMPLOYEE}/${id}`, payload);
      showToast({ type: 'success', title: 'Employee updated', message: 'Employee updated successfully!' });
      navigate('/hr/manage-employees');
    } catch (error) {
      const data = error.response?.data;
      const msg =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        (error.response?.status === 403 && 'You do not have permission to update employees.') ||
        (error.response?.status === 401 && 'Please log in again.') ||
        (error.response?.status === 400 && (data?.message || 'Invalid request. Check the form.')) ||
        'Failed to update employee. Try again or contact support.';
      showToast({ type: 'error', title: 'Update failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Edit Employee</h2>
          <p className="text-muted mb-0">Update employee details</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {loadingEmployee ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-2 mb-0">Loading employee...</p>
                  </div>
                ) : (
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
                          Company Email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope size={14} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            className={`form-control ${errors.companyEmail ? 'is-invalid' : ''}`}
                            name="companyEmail"
                            value={formData.companyEmail}
                            onChange={handleChange}
                            placeholder="employee@bubble.com"
                          />
                        </div>
                        {errors.companyEmail && <div className="invalid-feedback d-block">{errors.companyEmail}</div>}
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
  <label className="form-label fw-semibold">Sub Business Unit</label>
  <input
    type="text"
    className={`form-control ${errors.subBusinessUnit ? 'is-invalid' : ''}`}
    name="subBusinessUnit"
    value={formData.subBusinessUnit}
    onChange={handleChange}
    placeholder="Enter sub business unit"
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
                        <label className="form-label fw-semibold">Status</label>
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
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

                      <div className="col-md-6">
  <label className="form-label fw-semibold">Office Location</label>
  <input
    type="text"
    className={`form-control ${errors.currentOfficeLocation ? 'is-invalid' : ''}`}
    name="currentOfficeLocation"
    value={formData.currentOfficeLocation}
    onChange={handleChange}
    placeholder="Enter office location"
  />
  {errors.currentOfficeLocation && (
    <div className="invalid-feedback d-block">
      {errors.currentOfficeLocation}
    </div>
  )}
</div>

<div className="col-md-6">
  <label className="form-label fw-semibold">Manager ID</label>
  <input
    type="number"
    className={`form-control ${errors.managerId ? 'is-invalid' : ''}`}
    name="managerId"
    value={formData.managerId}
    onChange={handleChange}
    placeholder="Enter manager employee ID"
  />
  {errors.managerId && (
    <div className="invalid-feedback d-block">
      {errors.managerId}
    </div>
  )}
</div>

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
                          placeholder="50000"
                        />
                        {errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
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
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/hr/manage-employees')}>
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

export default EditEmployee;
