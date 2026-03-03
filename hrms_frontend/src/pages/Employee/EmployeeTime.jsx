import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import './EmployeeTime.css';

const DEFAULT_LEAVE_BALANCES = [
  { id: 1, type: 'Bereavement Leave', available: 3, total: 3, note: 'Total' },
  { id: 2, type: 'Casual Leave', available: 12, total: 12, note: 'Annual allotment' },
  { id: 3, type: 'Earned Leave', available: 12, total: 12, note: 'Carry forward (last year)' },
  { id: 4, type: 'Election Leave', available: 1, total: 1, note: 'Per year' },
  { id: 5, type: 'Maternity Leave', available: 182, total: 182, note: 'Days' },
  { id: 6, type: 'Paternity Leave', available: 8, total: 8, note: 'Days' },
  { id: 7, type: 'Optional Leave', available: 2, total: 2, note: 'Days' }
];

const EmployeeTime = () => {
  const { user } = useAuth();
  const { personal } = useAppState();
  const employeeId = user?.employeeId;
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendancePage, setAttendancePage] = useState(1);
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    totalDays: '',
  });
  const [leaveBalances, setLeaveBalances] = useState(DEFAULT_LEAVE_BALANCES);
  const [leaveBalancesLoading, setLeaveBalancesLoading] = useState(false);
  const [leaveBalancesError, setLeaveBalancesError] = useState('');
  const [message, setMessage] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [activeSection, setActiveSection] = useState('attendance');

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TIME.ATTENDANCE_ME);
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendance([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  

  const handleHolidayRequest = (holiday) => {
    setActiveSection('leave');
  
    const optionalLeave = leaveBalances.find(
      (l) => l.type.toLowerCase() === 'optional leave'
    );
  
    const leaveId = optionalLeave ? String(optionalLeave.id) : '';
  
    setLeaveForm((prev) => ({
      ...prev,
      leaveTypeId: leaveId,
      fromDate: holiday?.date || '',
      toDate: holiday?.date || '',
      totalDays: '1',
    }));
  
    setMessage('');
  };

  const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const normalizeLeaveBalances = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      const total = toNumberOrNull(item.totalLeaves ?? item.maxPerYear ?? item.total);
      const available = toNumberOrNull(item.remainingLeaves ?? item.available ?? item.remaining);
      const used = toNumberOrNull(
        item.usedLeaves ?? (total !== null && available !== null ? total - available : null)
      );
      const resolvedType = item.leaveTypeName ?? item.leaveName ?? item.type ?? `Leave ${index + 1}`;
      const carryForwardNote =
        resolvedType.toLowerCase().includes('earned') ? 'Carry forward (last year)' : 'Carry forward allowed';
      const note =
        item.note ??
        (item.carryForwardAllowed ? carryForwardNote : total !== null ? 'Annual allotment' : 'As per policy');
      return {
        id: Number(item.leaveTypeId ?? item.id ?? index + 1),
        type: resolvedType,
        available,
        total,
        used,
        note,
        carryForwardAllowed: item.carryForwardAllowed ?? false,
      };
    });
  };

  const fetchLeaveBalances = async () => {
    setLeaveBalancesLoading(true);
    setLeaveBalancesError('');
  
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TIME.LEAVE_BALANCES_ME);
      const normalized = normalizeLeaveBalances(res.data);
  
      // ---- MERGE DEFAULT + API (KEY FIX) ----
      const merged = [...DEFAULT_LEAVE_BALANCES];
  
      normalized.forEach((apiLeave) => {
        const index = merged.findIndex(
          (leave) =>
            leave.id === apiLeave.id ||
            leave.type.toLowerCase() === apiLeave.type.toLowerCase()
        );
  
        if (index >= 0) {
          merged[index] = {
            ...merged[index],
            ...apiLeave,
          };
        } else {
          merged.push(apiLeave);
        }
      });
  
      setLeaveBalances(merged);
    } catch (error) {
      setLeaveBalancesError(
        'Unable to load leave balances right now. Showing default values.'
      );
      setLeaveBalances(DEFAULT_LEAVE_BALANCES);
    } finally {
      setLeaveBalancesLoading(false);
    }
  };
  const [leaveHistory, setLeaveHistory] = useState([]);
const [leaveHistoryLoading, setLeaveHistoryLoading] = useState(false);

const fetchLeaveHistory = async () => {
  setLeaveHistoryLoading(true);

  try {
    const res = await axiosInstance.get(
      API_ENDPOINTS.TIME.LEAVE_HISTORY_ME
    );

    setLeaveHistory(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error('Leave history error:', error);
    setLeaveHistory([]);
  } finally {
    setLeaveHistoryLoading(false);
  }
};


  useEffect(() => {
    fetchAttendance();
    fetchLeaveHistory(); 
    fetchLeaveBalances();
  }, [employeeId]);

  const handleCheckIn = async () => {
    setAttendanceMessage('');
    try {
      const params = { source: 'WEB' };
      await axiosInstance.post(API_ENDPOINTS.TIME.CHECK_IN_ME, null, { params });
      setAttendanceMessage('Check-in successful.');
      fetchAttendance();
    } catch (error) {
      setAttendanceMessage(error.response?.data?.message || 'Check-in failed.');
    }
  };

  const handleCheckOut = async () => {
    setAttendanceMessage('');
    try {
      const params = { source: 'WEB' };
      await axiosInstance.post(API_ENDPOINTS.TIME.CHECK_OUT_ME, null, { params });
      setAttendanceMessage('Check-out successful.');
      fetchAttendance();
    } catch (error) {
      setAttendanceMessage(error.response?.data?.message || 'Check-out failed.');
    }
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveTypeSelect = (value) => {
    const selected = leaveBalances.find(
      (l) => String(l.id) === String(value)
    );
  
    setLeaveForm((prev) => ({
      ...prev,
      leaveTypeId: value,
      totalDays:
        selected?.type?.toLowerCase() === 'optional leave'
          ? '1'
          : prev.totalDays,
    }));
  
    setMessage('');
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!employeeId) return;
    if (!leaveForm.leaveTypeId) {
      setMessage('Please select a leave type.');
      return;
    }
    const requestedDays = Number(leaveForm.totalDays);
    if (!Number.isFinite(requestedDays) || requestedDays <= 0) {
      setMessage('Please enter a valid number of days.');
      return;
    }
    if (leaveForm.fromDate && leaveForm.toDate && leaveForm.toDate < leaveForm.fromDate) {
      setMessage('To date must be on or after the from date.');
      return;
    }
    if (selectedLeave && Number.isFinite(selectedLeave.available) && requestedDays > selectedLeave.available) {
      setMessage(`Only ${selectedLeave.available} day${selectedLeave.available === 1 ? '' : 's'} available for ${selectedLeave.type}.`);
      return;
    }
    const appliedLeave = selectedLeave;
    try {
      await axiosInstance.post(API_ENDPOINTS.TIME.LEAVE_APPLY, {
        employeeId,
        leaveTypeId: Number(leaveForm.leaveTypeId),
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        totalDays: requestedDays,
      });
      setMessage('Leave applied successfully.');
      setLeaveForm({ leaveTypeId: '', fromDate: '', toDate: '', totalDays: '' });
      if (appliedLeave && Number.isFinite(appliedLeave.available)) {
        setLeaveBalances((prev) =>
          prev.map((leave) => {
            if (leave.id !== appliedLeave.id) return leave;
            const updatedAvailable = Math.max(0, (leave.available ?? 0) - requestedDays);
            const currentUsed =
              leave.used ??
              (leave.total !== null && leave.available !== null ? Math.max(leave.total - leave.available, 0) : null);
            return {
              ...leave,
              available: updatedAvailable,
              used: currentUsed !== null ? currentUsed + requestedDays : currentUsed,
            };
          })
        );
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Leave apply failed.');
    }
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((row) => row.date === todayKey);
  const canCheckIn = !todayRecord || !todayRecord.checkIn;
  const canCheckOut = !!todayRecord && !!todayRecord.checkIn && !todayRecord.checkOut;
  const attendancePageSize = 5;

  const currentYear = new Date().getFullYear();
  const yearlyHolidays = useMemo(
    () => [
      { date: `${currentYear}-01-01`, name: "New Year's Day" },
      { date: `${currentYear}-01-15`, name: 'Makar Sankranti / Pongal', optional: true },
      { date: `${currentYear}-01-26`, name: 'Republic Day' },
      { date: `${currentYear}-03-04`, name: 'Holi' },
      { date: `${currentYear}-05-01`, name: 'May Day' },
      { date: `${currentYear}-05-28`, name: 'Bakri-ID', optional: true },
      { date: `${currentYear}-09-04`, name: 'Krishna Janmashtami', optional: true },
      { date: `${currentYear}-09-14`, name: 'Ganesh Chaturthi' },
      { date: `${currentYear}-10-02`, name: 'Gandhi Jayanti' },
      { date: `${currentYear}-10-10`, name: 'Vijayadashami / Dussehra' },
      { date: `${currentYear}-11-09`, name: 'Diwali' },
      { date: `${currentYear}-12-25`, name: 'Christmas' },
    ],
    [currentYear]
  );

  const selectedLeave = useMemo(() => {
    const id = Number(leaveForm.leaveTypeId);
    return leaveBalances.find((leave) => leave.id === id);
  }, [leaveForm.leaveTypeId, leaveBalances]);

  const normalizedGender = useMemo(() => {
    return (personal?.gender || '').trim().toLowerCase();
  }, [personal?.gender]);
  
  const isFemale = normalizedGender === 'female';
  const isMale = normalizedGender === 'male';

  const isLeaveTypeVisible = useCallback((leave) => {
    const type = (leave?.type || '').toLowerCase();
  
    // gender not selected → show all
    if (!normalizedGender) return true;
  
    if (normalizedGender === 'male' && type === 'maternity leave') {
      return false;
    }
  
    if (normalizedGender === 'female' && type === 'paternity leave') {
      return false;
    }
  
    return true;
  }, [normalizedGender]);

  const visibleLeaveBalances = useMemo(
    () => leaveBalances.filter((leave) => isLeaveTypeVisible(leave)),
    [leaveBalances, isLeaveTypeVisible]
  );

  useEffect(() => {
    if (!leaveForm.leaveTypeId) return;
    if (selectedLeave && !isLeaveTypeVisible(selectedLeave)) {
      setLeaveForm((prev) => ({ ...prev, leaveTypeId: '' }));
    }
  }, [leaveForm.leaveTypeId, selectedLeave, isLeaveTypeVisible]);

  const parsedTotalDays = Number(leaveForm.totalDays);
  const hasTotalDays = leaveForm.totalDays !== '' && Number.isFinite(parsedTotalDays);
  const availableDays = selectedLeave?.available;
  const isLimitedLeave = selectedLeave && Number.isFinite(availableDays);
  const isOutOfBalance = isLimitedLeave && availableDays <= 0;
  const exceedsBalance = isLimitedLeave && hasTotalDays && parsedTotalDays > availableDays;
  const invalidDays = hasTotalDays && parsedTotalDays <= 0;
  const invalidDateRange = leaveForm.fromDate && leaveForm.toDate && leaveForm.toDate < leaveForm.fromDate;
  const projectedRemaining = isLimitedLeave && hasTotalDays ? Math.max(availableDays - parsedTotalDays, 0) : null;

  const leaveValidationMessage = useMemo(() => {
    if (!leaveForm.leaveTypeId) return '';
    if (isOutOfBalance) return 'No remaining balance for this leave type.';
    if (invalidDays) return 'Enter a valid number of days.';
    if (exceedsBalance) {
      const safeAvailable = Number.isFinite(availableDays) ? availableDays : 0;
      return `Only ${safeAvailable} day${safeAvailable === 1 ? '' : 's'} available for ${selectedLeave?.type}.`;
    }
    if (invalidDateRange) return 'End date must be on or after the start date.';
    return '';
  }, [
    leaveForm.leaveTypeId,
    isOutOfBalance,
    invalidDays,
    exceedsBalance,
    invalidDateRange,
    availableDays,
    selectedLeave?.type,
  ]);

  const isSubmitDisabled =
    !employeeId ||
    !leaveForm.leaveTypeId ||
    !leaveForm.fromDate ||
    !leaveForm.toDate ||
    !hasTotalDays ||
    isOutOfBalance ||
    invalidDays ||
    exceedsBalance ||
    invalidDateRange;

  const holidayByDate = useMemo(() => {
    const map = new Map();
    yearlyHolidays.forEach((h) => {
      if (h.date) map.set(h.date, h);
    });
    return map;
  }, [yearlyHolidays]);

  const sortedHolidays = useMemo(() => {
    return [...yearlyHolidays].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [yearlyHolidays]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startDay; i += 1) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [calendarMonth]);

  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const sortedAttendance = useMemo(() => {
    const rows = Array.isArray(attendance) ? [...attendance] : [];
    const todayIndex = rows.findIndex((row) => row.date === todayKey);
    const todayRow = todayIndex >= 0 ? rows.splice(todayIndex, 1)[0] : null;
    rows.sort((a, b) => {
      const aTime = a?.date ? new Date(a.date).getTime() : 0;
      const bTime = b?.date ? new Date(b.date).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return 0;
    });
    if (todayRow) {
      rows.unshift(todayRow);
    }
    return rows;
  }, [attendance, todayKey]);

  const totalAttendancePages = Math.max(1, Math.ceil(sortedAttendance.length / attendancePageSize));
  const safeAttendancePage = Math.min(attendancePage, totalAttendancePages);
  const attendanceStartIndex = (safeAttendancePage - 1) * attendancePageSize;
  const pagedAttendance = sortedAttendance.slice(attendanceStartIndex, attendanceStartIndex + attendancePageSize);
  const attendancePages = Array.from({ length: totalAttendancePages }, (_, index) => index + 1);

  useEffect(() => {
    setAttendancePage(1);
  }, [attendance.length, todayKey]);

  useEffect(() => {
    if (attendancePage > totalAttendancePages) {
      setAttendancePage(totalAttendancePages);
    }
  }, [attendancePage, totalAttendancePages]);

  const sectionTabs = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'leave', label: 'Leave' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'holidays', label: 'Holidays' },
    { key: 'leaveHistory', label: 'Leave History' },
  ];



  return (
    <Layout>
      <div className="container-fluid time-page">
        <div className="mb-4">
          <h2 className="fw-bold">Time Management</h2>
          <p className="text-muted mb-0">Attendance, leaves, shifts, and holidays</p>
        </div>

        <div className="time-tabs mb-4" role="tablist">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`time-tab ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
              role="tab"
              aria-selected={activeSection === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'attendance' && (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Attendance</h5>
                      <div className="text-muted small">Track your daily check-in and check-out</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={handleCheckIn} disabled={!canCheckIn}>
                        Check In
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleCheckOut} disabled={!canCheckOut}>
                        Check Out
                      </button>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <span className="badge text-bg-primary">Web (IP)</span>
                  </div>
                  {attendanceMessage && <div className="alert alert-info py-2">{attendanceMessage}</div>}
                  {loadingAttendance ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : attendance.length === 0 ? (
                    <p className="text-muted mb-0">No attendance records yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Source</th>
                            <th>Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedAttendance.map((row, idx) => (
                            <tr key={`${row.date}-${idx}`} className={row.date === todayKey ? 'attendance-today' : ''}>
                              <td>{row.date || '-'}</td>
                              <td>{row.checkIn || '-'}</td>
                              <td>{row.checkOut || '-'}</td>
                              <td>{row.status || '-'}</td>
                              <td>{row.source || '-'}</td>
                              <td>
                                {row.latitude && row.longitude
                                  ? `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`
                                  : row.ipAddress || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="attendance-pagination">
                        <div className="attendance-pagination-info">
                          Showing {attendanceStartIndex + 1}-
                          {Math.min(attendanceStartIndex + attendancePageSize, sortedAttendance.length)} of{' '}
                          {sortedAttendance.length}
                        </div>
                        <nav aria-label="Attendance pagination">
                          <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${safeAttendancePage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                type="button"
                                onClick={() => setAttendancePage((prev) => Math.max(1, prev - 1))}
                              >
                                Prev
                              </button>
                            </li>
                            {attendancePages.map((page) => (
                              <li key={page} className={`page-item ${page === safeAttendancePage ? 'active' : ''}`}>
                                <button className="page-link" type="button" onClick={() => setAttendancePage(page)}>
                                  {page}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${safeAttendancePage === totalAttendancePages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                type="button"
                                onClick={() => setAttendancePage((prev) => Math.min(totalAttendancePages, prev + 1))}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'leave' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="leave-balance-header">
                    <div>
                      <h5 className="fw-bold mb-1">Leave Balance</h5>
                      <div className="text-muted small">Summary of your available leave balances</div>
                    </div>
                    {selectedLeave ? (
                      <span className="leave-selected-pill">Selected: {selectedLeave.type}</span>
                    ) : (
                      <span className="leave-selected-pill muted">Select a leave type</span>
                    )}
                  </div>
                  {leaveBalancesError && <div className="alert alert-warning py-2">{leaveBalancesError}</div>}
                  {leaveBalancesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    <div className="leave-balance-list">
                      {visibleLeaveBalances.map((leave) => {
                        const total = leave.total;
                        const available = leave.available;
                        const isActive = selectedLeave?.id === leave.id;
                        return (
                          <button
                            key={leave.id}
                            type="button"
                            className={`leave-balance-row ${isActive ? 'active' : ''}`}
                            onClick={() => handleLeaveTypeSelect(String(leave.id))}
                            aria-pressed={isActive}
                          >
                            <div className="leave-row-main">
                              <div className="leave-row-title">{leave.type}</div>
                              <div className="leave-row-meta">
                                {total !== null ? `Available ${available ?? '-'} / ${total}` : 'Policy based'}
                              </div>
                            </div>
                            <div className="leave-row-values">
                              <div className="leave-row-available">{available ?? '-'}</div>
                              <div className="leave-row-note">{leave.note}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="leave-form-header">
                    <div>
                      <h5 className="fw-bold mb-1">Apply Leave</h5>
                      <div className="text-muted small">Submit a leave request with dates and days</div>
                    </div>
                    {selectedLeave ? (
                      <span className="leave-selected-pill">{selectedLeave.type}</span>
                    ) : (
                      <span className="leave-selected-pill muted">No selection</span>
                    )}
                  </div>
                  {message && <div className="alert alert-info">{message}</div>}
                  <div className="leave-form-metrics mb-3">
                    <div className="leave-metric">
                      <div className="leave-metric-label">Available</div>
                      <div className="leave-metric-value">{selectedLeave ? selectedLeave.available ?? '-' : '-'}</div>
                    </div>
                    <div className="leave-metric">
                      <div className="leave-metric-label">After Request</div>
                      <div className="leave-metric-value">{projectedRemaining ?? '-'}</div>
                    </div>
                  </div>
                  <form onSubmit={handleApplyLeave}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Leave Type</label>
                        <select
                          className="form-select"
                          name="leaveTypeId"
                          value={leaveForm.leaveTypeId}
                          onChange={(e) => handleLeaveTypeSelect(e.target.value)}
                        >
                          <option value="">Select a leave type</option>
                          {visibleLeaveBalances.map((leave) => (
                            <option key={leave.id} value={leave.id}>
                              {leave.type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Days Requested</label>
                        <input
  type="number"
  name="totalDays"
  className="form-control"
  value={leaveForm.totalDays}
  onChange={handleLeaveChange}
  min="1"
  step="1"
  max={isLimitedLeave ? availableDays : undefined}
  disabled={
    !leaveForm.leaveTypeId ||
    isOutOfBalance ||
    selectedLeave?.type?.toLowerCase() === 'optional leave'
  }
/>
                        {isLimitedLeave && (
                          <div className="form-text">Max allowed: {availableDays} days for this leave type.</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">From</label>
                        <input
                          type="date"
                          name="fromDate"
                          className="form-control"
                          value={leaveForm.fromDate}
                          onChange={handleLeaveChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">To</label>
                        <input
                          type="date"
                          name="toDate"
                          className="form-control"
                          value={leaveForm.toDate}
                          onChange={handleLeaveChange}
                          min={leaveForm.fromDate || undefined}
                        />
                      </div>
                      {leaveValidationMessage && (
                        <div className="col-12">
                          <div className="leave-validation">{leaveValidationMessage}</div>
                        </div>
                      )}
                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit" disabled={isSubmitDisabled}>
                          Submit Leave
                        </button>
                      </div>
                    </div>
                  </form>
                  {selectedLeave && (
                    <div className="leave-detail-card">
                      <div className="leave-detail-title">{selectedLeave.type}</div>
                      <div className="leave-detail-meta">
                        Available: {selectedLeave.available ?? '-'}{' '}
                        {selectedLeave.total !== null ? `/ ${selectedLeave.total}` : ''}
                      </div>
                      <div className="leave-detail-note">{selectedLeave.note}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

{activeSection === 'calendar' && (
  <div className="row g-4">
    <div className="col-12">
      <div className="card border-0 shadow-sm time-card">
        <div className="card-body">
          <div className="calendar-header">
            <div>
              <h5 className="fw-bold mb-1">Calendar</h5>
              <div className="text-muted small">{monthLabel}</div>
            </div>
            <div className="calendar-actions">
              <button className="btn btn-outline-secondary btn-sm" onClick={goPrevMonth}>
                Prev
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={goNextMonth}>
                Next
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={idx} className="calendar-cell empty" />;

              const key = date.toISOString().split('T')[0];
              const holiday = holidayByDate.get(key);
              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  className={`calendar-cell ${holiday ? 'holiday' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="calendar-date">{date.getDate()}</div>
                  {holiday && (
                    <div className="calendar-holiday">
                      {holiday.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeSection === 'holidays' && (
  <div className="row g-4">
    <div className="col-12">
      <div className="card border-0 shadow-sm time-card">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Yearly Holidays</h5>

          <div className="holiday-list">
            {sortedHolidays.map((holiday) => (
              <div
                key={`${holiday.date}-${holiday.name}`}
                className={`holiday-row ${holiday.optional ? 'optional' : ''}`}
              >
                <div className="holiday-date">{holiday.date}</div>
                <div className="holiday-name">{holiday.name}</div>
                <div className="d-flex align-items-center gap-2">
  <div className="holiday-tag">
    {holiday.optional ? 'Optional' : 'Holiday'}
  </div>

  {holiday.optional && (
    <button
      type="button"
      className="btn btn-sm btn-outline-primary"
      onClick={() => handleHolidayRequest(holiday)}
    >
      Request
    </button>
  )}
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeSection === 'leaveHistory' && (
  <div className="row g-4">
    <div className="col-12">
      <div className="card border-0 shadow-sm time-card">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Leave History</h5>

          {leaveHistoryLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : leaveHistory.length === 0 ? (
            <p className="text-muted mb-0">No leave history found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Total Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((leave, idx) => (
                    <tr key={idx}>
                      <td>{leave.fromDate || '-'}</td>
                      <td>{leave.toDate || '-'}</td>
                      <td>{leave.totalDays || '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            leave.status === 'APPROVED'
                              ? 'text-bg-success'
                              : leave.status === 'REJECTED'
                              ? 'text-bg-danger'
                              : 'text-bg-warning'
                          }`}
                        >
                          {leave.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </Layout>
  );
};

export default EmployeeTime;