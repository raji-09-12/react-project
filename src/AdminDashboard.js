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
    totalApprovedLeave: 0,
    totalPendingLeave: 0,
    totalRejectedLeave: 0,
    totalCancelledLeave: 0,
    totalApprovedPermission: 0,
    totalPendingPermission: 0,
    totalRejectedPermission: 0,
    totalCancelledPermission: 0,
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
        const activeEmployees = employeeResponse.data.filter((employee) => employee.status === 'active');
        setEmployees(activeEmployees);

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

  const calculateLeaveAndPermissionStats = (leaveHistory) => {
    let totals = {
      totalApprovedLeave: 0,
      totalPendingLeave: 0,
      totalRejectedLeave: 0,
      totalCancelledLeave: 0,
      totalApprovedPermission: 0,
      totalPendingPermission: 0,
      totalRejectedPermission: 0,
      totalCancelledPermission: 0,
    };

    leaveHistory.forEach((leave) => {
      if (leave.leaveType?.toLowerCase() === 'leave') {
        // Calculating totals for leave
        if (leave.status?.toLowerCase() === 'approved') {
          totals.totalApprovedLeave += 1|| 0;
        } else if (leave.status?.toLowerCase() === 'pending') {
          totals.totalPendingLeave += 1|| 0;
        } else if (leave.status?.toLowerCase() === 'rejected') {
          totals.totalRejectedLeave += 1 || 0;
        } else if (leave.status?.toLowerCase() === 'cancelled') {
          totals.totalCancelledLeave += 1 || 0;
        }
      } else if (leave.leaveType?.toLowerCase() === 'permission') {
        // Calculating totals for permission
        if (leave.status?.toLowerCase() === 'approved') {
          totals.totalApprovedPermission += 1|| 0;
        } else if (leave.status?.toLowerCase() === 'pending') {
          totals.totalPendingPermission += 1 || 0;
        } else if (leave.status?.toLowerCase() === 'rejected') {
          totals.totalRejectedPermission += 1 || 0;
        } else if (leave.status?.toLowerCase() === 'cancelled') {
          totals.totalCancelledPermission += 1 || 0;
        }
      }
    });

    return totals;
  };

  useEffect(() => {
    if (leaveHistory.length >= 0) {
      const calculatedTotals = calculateLeaveAndPermissionStats(leaveHistory);
      setTotals(calculatedTotals);
    }
  }, [leaveHistory]);

  

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
    leave.status === 'Approved'   
     
  );
});

  
  const totalLeaveDays = leaveHistory.reduce((total, leave) => {
    if (leave.leaveType?.toLowerCase() === 'leave' && leave.status?.toLowerCase() === 'approved') {
      return total + (leave.totalDays || 0); // Add totalDays for "Leave" entries
    }
    return total;
  }, 0);

  const totalPermissionDays = leaveHistory.reduce((total, leave) => {
    if (leave.leaveType?.toLowerCase() === 'permission' &&  // Check if it's "Permission"
    leave.status?.toLowerCase() === 'approved') { 
      return total + (leave.totalDays || 0); // Add totalDays for "Permission" entries
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
    const confirmApproval = window.confirm("Are you sure you want to approve this leave?");
    if(confirmApproval){
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
  }
  };

  const handleReject = async (id) => {
    const statusReason = prompt("Are you sure you want to reject this leave?");
    if(!statusReason){
      alert("Reject reason is required!");
      return;
    }
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
            leave._id === id ? { ...leave, status: 'rejected', statusReason  } : leave
          )
        );
        alert(`Leave rejected successfully.\nReason: ${statusReason}`);
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
      <div className="md:p-14 w-full ml-0 md:ml-64 transition-all duration-300">
        <h2 className="text-4xl font-bold text-center mb-4">Welcome {userData?.fullname}</h2>
        <div className="bg-pink-100 shadow-sm rounded-lg p-8 border border-gray-300 flex flex-col justify-center items-center">
            <p className="text-3xl font-bold text-gray-800 mb-4">Employees</p> <span className="text-gray-800 text-5xl">{employees.length}</span>
        </div>
        
        <div className="mt-6 grid lg:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-6 overflow-x-auto">
          
          
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Leave Request: {totalLeaveCount} </h3>

            {/* Container for the column layout */}
            <div className="flex flex-col gap-4 grid lg:grid-cols-5 sm:grid-cols-5">
              
            <div className="bg-gray-100 shadow-sm rounded-lg p-8 border border-gray-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Days</p> <span className="text-gray-800 text-5xl">{totalLeaveDays}</span>
            </div>

              <div className="bg-yellow-100 shadow-sm rounded-lg p-8 border border-yellow-300 flex flex-col justify-center items-center ">
                <p className="text-xl font-bold text-gray-600 mb-4">Pending</p> <span className="text-gray-800  text-5xl">{totals.totalPendingLeave}</span>
              </div>
              <div className="bg-green-100 shadow-sm rounded-lg p-8 border border-green-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Approved </p><span className="text-gray-800 text-5xl"> {totals.totalApprovedLeave}</span>
              </div>
              <div className="bg-red-100 shadow-sm rounded-lg p-8 border border-red-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Rejected </p><span className="text-gray-800 text-5xl">{totals.totalRejectedLeave}</span>
              </div>
              <div className="bg-blue-100 shadow-sm rounded-lg p-8 border border-blue-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Cancelled </p><span className="text-gray-800 text-5xl">{totals.totalCancelledLeave}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Permission Request: {totalPermissionCount} </h3>

            {/* Container for the column layout */}
            <div className="flex flex-col gap-4 grid lg:grid-cols-5 sm:grid-cols-5">
              
            <div className="bg-gray-100 shadow-sm rounded-lg p-8 border border-gray-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Permission</p> <span className="text-gray-800 text-5xl">{totalPermissionDays}</span>
            </div>

              <div className="bg-yellow-100 shadow-sm rounded-lg p-8 border border-yellow-300 flex flex-col justify-center items-center ">
                <p className="text-xl font-bold text-gray-600 mb-4">Pending</p> <span className="text-gray-800  text-5xl">{totals.totalPendingPermission}</span>
              </div>
              <div className="bg-green-100 shadow-sm rounded-lg p-8 border border-green-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Approved </p><span className="text-gray-800 text-5xl"> {totals.totalApprovedPermission}</span>
              </div>
              <div className="bg-red-100 shadow-sm rounded-lg p-8 border border-red-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Rejected </p><span className="text-gray-800 text-5xl">{totals.totalRejectedPermission}</span>
              </div>
              <div className="bg-blue-100 shadow-sm rounded-lg p-8 border border-blue-300 flex flex-col justify-center items-center">
                <p className="text-xl font-bold text-gray-600 mb-4">Cancelled </p><span className="text-gray-800 text-5xl">{totals.totalCancelledPermission}</span>
              </div>
            </div>
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
