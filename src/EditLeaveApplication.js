import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditLeaveApplication = () => {
  const { leaveId } = useParams(); // Get leaveId from route params
  const navigate = useNavigate(); // For navigation
  const [leaveType, setLeaveType] = useState("");
  const [leaveDuration, setLeaveDuration] = useState("");
  const [permissionType, setPermissionType] = useState("");
  const [halfDayOption, setHalfDayOption] = useState('');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalDays, setTotalDays] = useState(0);

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

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/view-leave/${leaveId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { data } = response.data;
        setLeaveType(data.leaveType);
        setLeaveDuration(data.leaveDuration);
        setPermissionType(data.permissionType);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setReason(data.reason);
      } catch (error) {
        console.error("Error fetching leave details:", error);
        setError("Failed to load leave details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [leaveId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const leaveData = { leaveType, leaveDuration, permissionType, halfDayOption, startDate, endDate, reason };

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/edit-leave/${leaveId}`, leaveData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log(response.data);
      navigate("/view-leaves"); // Redirect after successful update
    } catch (error) {
      console.error("Error updating leave application:", error);
      setError("Failed to update leave application.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">  
    <div className="w-64 bg-gray-800 text-white p-6 fixed h-full left-0 top-0">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <ul>
          <li><a href="/dashboard" className="block py-2 px-4 hover:bg-blue-700 rounded">Dashboard</a></li>
          <li><a href="/profile" className="block py-2 px-4 hover:bg-blue-700 rounded">Profile</a></li>
          <li><a href="/apply-leave" className="block py-2 px-4 hover:bg-blue-700 rounded">Apply Leave</a></li>
          <li><a href="/view-leaves" className="block py-2 px-4 hover:bg-blue-700 rounded">Leave History</a></li>
        </ul>
      </div>
      <div className="flex-1 p-6">
      <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Update for Leave or Permission</h2>

  
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
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
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
                  <label htmlFor="startDate" className="block text-left text-gray-700">Start Date</label>
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
};

export default EditLeaveApplication;
