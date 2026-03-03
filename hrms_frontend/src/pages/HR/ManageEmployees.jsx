import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAppState } from '../../context/AppStateContext';

const ManageEmployees = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { employees, employeesLoading, employeesError, refreshEmployees, setEmployees } = useAppState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const pageSize = 8;

  const fetchEmployees = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    await refreshEmployees();
    if (!silent) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.HR.DELETE_EMPLOYEE}/${id}`);
      setEmployees((prev) => prev.filter((emp) => emp.employeeId !== id));
      await fetchEmployees({ silent: true });
      showToast({ type: 'success', title: 'Employee deleted', message: 'Employee removed successfully.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: err.response?.data?.message || 'Failed to delete employee' });
    }
  };

  const fullName = (emp) => {
    const first = emp.firstName || '';
    const last = emp.lastName || '';
    return `${first} ${last}`.trim() || emp.companyEmail || '-';
  };

  const matchesSelection = (value, selected) => {
    if (!selected || selected === 'ALL') return true;
    if (!value) return false;
    return value.toLowerCase() === selected.toLowerCase();
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      matchesSelection(emp.department, selectedDepartment) &&
      matchesSelection(emp.designation, selectedDesignation) &&
      matchesSelection(emp.status, selectedStatus) &&
      (fullName(emp).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.companyEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const departmentOptions = Array.from(new Set(employees.map((emp) => emp.department).filter(Boolean)));
  const allDesignationOptions = Array.from(new Set(employees.map((emp) => emp.designation).filter(Boolean)));
  const statusOptions = Array.from(new Set(employees.map((emp) => emp.status).filter(Boolean)));

  const isDevelopmentDept = selectedDepartment && selectedDepartment.toLowerCase().includes('development');
  const isHrDept = selectedDepartment && selectedDepartment.toLowerCase().includes('hr');

  const technicalKeywords = ['developer', 'engineer', 'qa', 'tester', 'devops', 'frontend', 'backend', 'full stack'];
  const hrKeywords = ['hr', 'human resource', 'recruiter', 'manager'];

  const designationOptions = allDesignationOptions.filter((designation) => {
    const value = designation.toLowerCase();
    if (selectedDepartment === 'ALL') return true;
    if (isDevelopmentDept) {
      return technicalKeywords.some((keyword) => value.includes(keyword));
    }
    if (isHrDept) {
      return hrKeywords.some((keyword) => value.includes(keyword));
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedDesignation, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const pageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPages - 1);
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Layout>
      <div className="container-fluid page-gradient">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Manage Employees</h2>
            <p className="text-muted mb-0">View and manage all employees</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/hr/create-employee')}>
            <FaPlus size={14} /> Create Employee
          </button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0">
            <div className="row">
              <div className="col-12 col-md-6 col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaSearch className="text-muted" size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Search by name, email, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3 mt-2 mt-md-0">
                <select
                  className="form-select bg-light border-0"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-3 mt-2 mt-md-0">
                <select
                  className="form-select bg-light border-0"
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                >
                  <option value="ALL">All Designations</option>
                  {designationOptions.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-2 mt-2 mt-lg-0">
                <select
                  className="form-select bg-light border-0"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(loading || employeesLoading) ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-2 mb-0">Loading employees...</p>
            </div>
          ) : (error || employeesError) ? (
            <div className="text-center py-5 px-4">
              <p className="text-danger mb-2">{error || employeesError}</p>
              <button className="btn btn-outline-primary btn-sm" onClick={fetchEmployees}>
                Retry
              </button>
            </div>
          ) : (
            <div className="table-responsive manage-employee-table">
              <table className="table table-hover align-middle mb-0 manage-employee-table__table">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Name</th>
                    <th className="border-0">Email</th>
                    <th className="border-0">Department</th>
                    <th className="border-0">Designation</th>
                    <th className="border-0">Status</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <FaUser size={32} className="mb-2 opacity-50" />
                        <p className="mb-0">No employees found. Create one to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    pagedEmployees.map((emp) => (
                      <tr key={emp.employeeId}>
                        <td className="fw-semibold">{fullName(emp)}</td>
                        <td>{emp.companyEmail || '-'}</td>
                        <td>{emp.department || '-'}</td>
                        <td>{emp.designation || '-'}</td>
                        <td>
                          <span
                            className={`badge status-pill ${
                              emp.status === 'ACTIVE' ? 'text-bg-success' : 'text-bg-secondary'
                            }`}
                          >
                            {emp.status || '-'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => navigate(`/hr/manage-employees/${emp.employeeId}/edit`)}
                            title="Edit"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDeleteId(emp.employeeId)}
                            title="Delete"
                          >
                            <FaTrash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredEmployees.length > 0 && (
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-3">
            <div className="text-muted small">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredEmployees.length)} of{' '}
              {filteredEmployees.length} employees
            </div>
            <nav aria-label="Employee pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    type="button"
                  >
                    Prev
                  </button>
                </li>
                {pageNumbers().map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)} type="button">
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    type="button"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      {confirmDeleteId !== null && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h5 className="mb-2">Delete employee?</h5>
            <p className="text-muted mb-4">This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  await handleDelete(id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageEmployees;


