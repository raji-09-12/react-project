import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './EmployeeSidebar';
import { UserContext } from './UserContext';
function LeaveApplication() {
  const [leaveType, setLeaveType] = useState('');
  const [leaveDuration, setLeaveDuration] = useState('');
  const { userData } = useContext(UserContext);
  const [permissionType, setPermissionType] = useState('');
  const [halfDayOption, setHalfDayOption] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [existingLeave, setExistingLeave] = useState([]);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchExistingLeave = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized! Please log in again.');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}view-leave`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data.data)) {
          setExistingLeave(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching existing leave applications:', error);
        setError('Error fetching leave applications.');
      }
    };

    fetchExistingLeave();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized! Please log in again.');
      return;
    }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's time to midnight for accurate comparison

  const selectedStartDate = new Date(startDate);
  const selectedEndDate = endDate ? new Date(endDate) : null;

  // Validation for past dates
  if (selectedStartDate < today || (selectedEndDate && selectedEndDate < today)) {
    setError('You cannot apply for leave or permission for dates before today.');
    return;
  }

    const isDateTaken = existingLeave.some((leave) => {
      if (leave.status?.toLowerCase() === 'rejected' || leave.status?.toLowerCase() === 'cancelled') {
        return false;
      }
      const leaveStartDate = new Date(leave.startDate);
      const leaveEndDate = new Date(leave.endDate);

      const selectedStartDate = new Date(startDate);
      const selectedEndDate = new Date(endDate);

      // Check for overlapping leave dates
      return (
        (selectedStartDate >= leaveStartDate && selectedStartDate <= leaveEndDate) ||
        (selectedEndDate >= leaveStartDate && selectedEndDate <= leaveEndDate) ||
        (selectedStartDate <= leaveStartDate && selectedEndDate >= leaveEndDate)
      );
    });

    if (isDateTaken) {
      setError('The selected dates are already taken for leave or permission.');
      return;
    }

    const leaveData = { leaveType, permissionType, halfDayOption, startDate, endDate, reason, leaveDuration };
    console.log(token)
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}apply-leave`, leaveData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 201) {
        navigate('/view-leave'); // Redirect to employee list page after success
      }
      alert('Submitting application');
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message); 
      setError('Error submitting leave application');
      setMessage('');
    }
  };

  useEffect(() => {
    if (leaveType === 'Leave') {
      if (leaveDuration === 'Half Day') {
        setEndDate(''); 
        setTotalDays(0.5);
      } else if (startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        if (endDateObj >= startDateObj) {
          const differenceInTime = endDateObj - startDateObj;
          const differenceInDays = differenceInTime / (1000 * 3600 * 24) + 1;
          setTotalDays(differenceInDays);
        } else {
          setError('End date should be greater than or equal to start date.');
        }
       
      }
    } else if (leaveType === 'Permission') {
      setTotalDays(1); // Fixed value for permissions
    } else {
      setTotalDays(0); // Reset total days if no valid type
    }
  }, [leaveType, leaveDuration, startDate, endDate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} role={userData?.role}/>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Apply for Leave or Permission</h2>

          {/* Error and Success messages */}
          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit}>
            {/* Leave Type */}
            <div className="mb-4">
              <label htmlFor="leaveType" className="block text-left text-gray-700">Leave or Permission</label>
              <select
                id="leaveType"
                className="w-full p-2 border-2 border-gray-300 rounded-md"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Leave">Leave</option>
                <option value="Permission">Permission</option>
              </select>
            </div>

            {/* Leave Duration */}
            {leaveType === 'Leave' && (
              <div className="mb-4">
                <label htmlFor="leaveDuration" className="block text-left text-gray-700">Leave Duration</label>
                <select
                  id="leaveDuration"
                  className="w-full p-2 border-2 border-gray-300 rounded-md"
                  value={leaveDuration}
                  onChange={(e) => setLeaveDuration(e.target.value)}
                  required
                > <option value="">Select option</option>
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            )}

            {/* Morning/Evening Dropdown for Half Day */}
            {leaveDuration === 'Half Day' && (
              <div className="mb-4">
                <label htmlFor="halfDayOption" className="block text-left text-gray-700">
                  Select Half Day Option
                </label>
                <select
                  id="halfDayOption"
                  className="w-full p-2 border-2 border-gray-300 rounded-md"
                  value={halfDayOption}
                  onChange={(e) => setHalfDayOption(e.target.value)}
                  required
                >
                  <option value="">Select Morning or Evening</option>
                  <option value="Morning">First</option>
                  <option value="Evening">Last</option>
                </select>
              </div>
            )}

            {/* Permission Options */}
            {leaveType === 'Permission' && (
              <div className="mb-4">
                <label htmlFor="permissionType" className="block text-left text-gray-700">Permission Duration</label>
                <select
                  id="permissionType"
                  className="w-full p-2 border-2 border-gray-300 rounded-md"
                  value={permissionType}
                  onChange={(e) => setPermissionType(e.target.value)}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="First">First</option>
                  <option value="Last">Last</option>
                </select>
              </div>
            )}

            {/* Permission Start Date */}
            {leaveType === 'Permission' && (
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-left text-gray-700">Date</label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full p-2 border-2 border-gray-300 rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Leave Start and End Dates */}
            {leaveType === 'Leave' && (
              <>
                <div className="mb-4">
                  <label htmlFor="startDate" className="block text-left text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="w-full p-2 border-2 border-gray-300 rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                {leaveType === 'Leave' && leaveDuration === 'Full Day' && (
                  <div className="mb-4">
                    <label htmlFor="endDate" className="block text-left text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="w-full p-2 border-2 border-gray-300 rounded-md"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}


            {/* Total Days */}
            {leaveType === 'Leave' && totalDays > 0 && (
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold">Total Leave Days: {totalDays}</p>
              </div>
            )}
            {leaveType === 'Permission' && (
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold">Total Permission: {totalDays}</p>
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label htmlFor="reason" className="block text-left text-gray-700">Reason</label>
              <textarea
                id="reason"
                className="w-full p-2 border-2 border-gray-300 rounded-md"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit Leave Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplication;
