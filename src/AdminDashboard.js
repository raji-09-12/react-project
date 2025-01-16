import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './AdminSidebar';

function Dashboard() {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalApproved: 0,
    totalRejected: 0,
    totalPending: 0,
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUserData(response.data))
      .catch(() => setError('Error fetching profile data'));
  }, [navigate]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const employeeResponse = await axios.get(`${process.env.REACT_APP_API_URL}employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEmployees(employeeResponse.data);

        const leaveResponse = await axios.get(`${process.env.REACT_APP_API_URL}leave-history/:id`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLeaveHistory(leaveResponse.data.leaveHistory);
        setTotals({
          totalApproved: leaveResponse.data.totalApproved,
          totalRejected: leaveResponse.data.totalRejected,
          totalPending: leaveResponse.data.totalPending,
        });
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  

  const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const today = new Date();
const todayNormalized = normalizeDate(today);  // Normalize today's date

const todayLeaveData = leaveHistory.filter((leave) => {
  // Normalize both start and end dates of the leave
  const leaveStartDate = normalizeDate(new Date(leave.startDate));  // Normalize leave start date
  const leaveEndDate = normalizeDate(new Date(leave.endDate || leave.startDate));  // Handle single-day leave

  // Check if today's date is within the leave range and if it's a full-day leave
  return (
    todayNormalized >= leaveStartDate && 
    todayNormalized <= leaveEndDate &&
    leave.status !== 'Rejected'     
  );
});

  
  const totalLeaveDays = leaveHistory.reduce((total, leave) => {
    if (leave.leaveType?.toLowerCase() === 'leave') {
      return total + (leave.totalDays || 0); // Add totalDays for "Leave" entries
    }
    return total;
  }, 0);

  const totalLeaveCount = leaveHistory?.filter(
    (leave) => leave.leaveType?.toLowerCase() === 'leave'
  ).length || 0;
  
  const totalPermissionCount = leaveHistory?.filter(
    (leave) => leave.leaveType?.toLowerCase() === 'permission'
  ).length || 0;

  const handleApprove = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}approve-leave/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        setLeaveHistory((prevState) =>
          prevState.map((leave) =>
            leave._id === id ? { ...leave, status: 'approved' } : leave
          )
        );
        alert('Leave approved successfully.');
      } else {
        alert('Failed to approve leave.');
      }
    } catch (error) {
      alert('Error approving leave. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}reject-leave/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        setLeaveHistory((prevState) =>
          prevState.map((leave) =>
            leave._id === id ? { ...leave, status: 'rejected' } : leave
          )
        );
        alert('Leave rejected successfully.');
      } else {
        alert('Failed to reject leave.');
      }
    } catch (error) {
      alert('Error rejecting leave. Please try again.');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const pendingLeaveData = leaveHistory.filter(leave => leave.status === 'Pending');

  return (
    <div className="flex min-h-screen">
      <Sidebar handleLogout={handleLogout} />
      <div className="ml-64 p-14 w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to {userData?.fullname}</h2>
        <div className="mt-6 grid grid-cols-7 gap-6 overflow-x-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Employee</h3>
            <p className="text-2xl font-bold text-gray-600">{employees.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Leave Requst</h3>
            <p className="text-2xl font-bold text-gray-600">{totalLeaveCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Leave Days</h3>
            <p className="text-2xl font-bold text-gray-600">{totalLeaveDays}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Permission</h3>
            <p className="text-2xl font-bold text-gray-600">{totalPermissionCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Pending</h3>
            <p className="text-2xl font-bold text-gray-600">{totals.totalPending}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Approved</h3>
            <p className="text-2xl font-bold text-gray-600">{totals.totalApproved}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Rejected</h3>
            <p className="text-2xl font-bold text-gray-600">{totals.totalRejected}</p>
          </div>
        </div>

        {/* Today's Leave Data Table */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Today's Leave Data</h3>
          {todayLeaveData.length > 0 ? (
            <table>
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-4 py-2">Employee Name</th>
                  <th className="border border-gray-400 px-4 py-2">Leave Type</th>
                  
                  <th className="border border-gray-400 px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayLeaveData.map((leave) => (
                  <tr key={leave._id}>
                    <td className="border border-gray-400 px-4 py-2">{leave.userId.fullname}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.leaveType} - {leave.permissionType}</td>
                    
                    <td className="border border-gray-400 px-4 py-2">{leave.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No leave data for today.</p>
          )}
        </div>

        {/* Pending Leave Data Table */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Pending Leave Requests</h3>
          {pendingLeaveData.length > 0 ? (
            <table>
              <thead>
                <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">Employee ID</th>
                  <th className="border border-gray-400 px-4 py-2">Employee Name</th>
                  <th className="border border-gray-400 px-4 py-2">Leave Type</th>
                  <th className="border border-gray-400 px-4 py-2">Reason</th>
                  <th className="border border-gray-400 px-4 py-2">Start Date</th>
                  <th className="border border-gray-400 px-4 py-2">End Date</th>
                  <th className="border border-gray-400 px-4 py-2">Total Days</th>
                  <th className="border border-gray-400 px-4 py-2">Status</th>
                  <th className="border border-gray-400 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaveData.map((leave) => (
                  <tr key={leave._id}>
                    <td className="border border-gray-400 px-4 py-2">{leave.userId.employeeid}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.userId.fullname}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.leaveType}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.reason}</td>
                    <td className="border border-gray-400 px-4 py-2">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.totalDays}</td>
                    <td className="border border-gray-400 px-4 py-2">{leave.status}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      <button
                        onClick={() => handleApprove(leave._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No pending leave requests.</p>
          )}
        </div>


      </div>
    </div>
  );
}

export default Dashboard;
