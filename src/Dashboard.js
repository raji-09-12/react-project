import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './EmployeeSidebar';

function Dashboard() {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [empleaveHistory, setempLeaveHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [userDataa, setUserDataa] = useState(null);
  const [totalLeave, setTotalLeave] = useState(0);
  const [totalPermission, setTotalPermission] = useState(0);
  const [loading, setLoading] = useState(true);
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
  const [error, setError] = useState(null);


  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');  // Or sessionStorage if you're using session storage
    
    // Redirect the user to the login page
    navigate('/login');  // Adjust the route for your login page
  };

  useEffect(() => {
    const fetchempLeaveHistory = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}leader-view-leave-history`, {
          
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const allLeave = response.data;
      const leaderDepartment = userData?.department || "";
      const userRole = userData?.role || ""; 

      let departmentLeave = [];

      
      if (userRole === "TeamLeader") {
        
        departmentLeave = allLeave.filter(
          (leave) => leave?.employeeDetails?.department === leaderDepartment && leave?.employeeDetails?.role === "Employee"
        );
      
      }else if (userRole === "Department Leader") {
        
        departmentLeave = allLeave.filter(
          (leave) => 
            leave?.employeeDetails?.department === leaderDepartment && 
            leave?.employeeDetails?.role !== "Department Leader"
        );
      }

      setempLeaveHistory(departmentLeave);
      } catch (error) {
        setError('Error fetching leave history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchempLeaveHistory();
  }, [userData]);

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }

    // Fetch user profile data from backend
    axios.get(`${process.env.REACT_APP_API_URL}profile`, {
      headers: {
        'Authorization': `Bearer ${token}` // Send token to backend to authenticate
      }
    })
    .then(response => {
      setUserDataa(response.data); // Assuming response contains user profile

      // Prepopulate editable fields with existing data
      
    })
    .catch(error => {
      console.error('Error fetching profile', error);
      setError('Error fetching profile data');
    });
  }, []);

  // Fetch total leave and permission data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}dashboard-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLeaveHistory(response.data.leaveHistory);
        setTotalLeave(response.data.totalLeave);
        setTotalPermission(response.data.totalPermission);
        setTotals({
          totalApproved: response.data.totalApproved,
          totalRejected: response.data.totalRejected,
          totalPending: response.data.totalPending,
        });
        
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  
  console.log(totals);

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
          totals.totalApprovedLeave += 1;
        } else if (leave.status?.toLowerCase() === 'pending') {
          totals.totalPendingLeave += 1;
        } else if (leave.status?.toLowerCase() === 'rejected') {
          totals.totalRejectedLeave += 1 ;
        } else if (leave.status?.toLowerCase() === 'cancelled') {
          totals.totalCancelledLeave += 1;
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

const totalLeaveDays = leaveHistory.reduce((total, leave) => {
  if (leave.leaveType?.toLowerCase() === 'leave'  && // Check if it's a "Leave"
  leave.status?.toLowerCase() === 'approved' 
    
  ) {
    return total + (leave.totalDays || 0); // Add totalDays for "Leave" entries
  }
  return total;
}, 0);

const totalPermissionDays = leaveHistory.reduce((total, leave) => {
  if (leave.leaveType?.toLowerCase() === 'permission' && // Check if it's "Permission"
      leave.status?.toLowerCase() === 'approved') { // Only approved permissions
    return total + (leave.totalDays || 0); // Add totalDays for "Permission" entries
  }
  return total;
}, 0);

const displayempLeaveHistory = empleaveHistory.filter(leave => leave.status === 'Pending');

const handleApprove = async (id) => {
  const confirmApproval = window.confirm("Are you sure you want to approve this leave?");
  if (confirmApproval) {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}approve-leave/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );

    if (response.status === 200) {
      setempLeaveHistory((prevState) =>
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
  const statusReason = prompt("Enter the Rejection Reason!");
  if(!statusReason){
    alert("Reject reason is required!");
    return;
  } 
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}reject-leave/${id}`,
      {reason: statusReason},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    

    if (response.status === 200) {
      setempLeaveHistory((prevState) =>
        prevState.map((leave) =>
          leave._id === id ? { ...leave, status: 'rejected', statusReason } : leave
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

const handleCancel = async (leaveId) => {
  const statusReason = window.prompt("Enter the Cancelled Reason!")
  if (!statusReason) {
      alert("Cancelled Reason is required!")
      return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
      setError("User not logged in.");
      return;
  }

  try {
      await axios.put(`${process.env.REACT_APP_API_URL}cancel-leave/${leaveId}`, {reason: statusReason}, {
          headers: { Authorization: `Bearer ${token}` },
      });

      // Update the leave's status in the state
      setempLeaveHistory(leaveHistory.map((leave) =>
          leave._id === leaveId ? { ...leave, status: 'Cancelled', statusReason } : leave
      ));

      setError(''); // Clear any previous errors
  } catch (error) {
      console.error("Error cancelling leave:", error);
      setError("Failed to cancel leave.");
  }
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

 
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} role={userData?.role} />

      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-300 md:p-14 w-full">
        <h2 className="text-5xl text-center font-bold mb-4">Welcome  {userDataa.fullname} </h2>
        

       
        {/* Display total leave and total permission */}
        <div className="mt-6 grid lg:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-6 overflow-x-auto">
          
          
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Leave Request: {totalLeave} </h3>

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
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Permission Request: {totalPermission} </h3>

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
        {userData?.role !== "Employee" && (  
        <div className="w-full bg-white p-6 shadow-lg rounded-lg mt-6">
          <h2 className="text-2xl font-bold text-left mb-4">Pending Leave Request
          </h2>
          {displayempLeaveHistory.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">Employee ID</th>
                <th className="border border-gray-400 px-4 py-2">Employee Name</th>
                <th className="border border-gray-400 px-4 py-2">Role</th>
                <th className="border border-gray-400 px-4 py-2">Leave Type</th>
                <th className="border border-gray-400 px-4 py-2">Reason</th>
                <th className="border border-gray-400 px-4 py-2">Start Date</th>
                <th className="border border-gray-400 px-4 py-2">End Date</th>
                <th className="border border-gray-400 px-4 py-2">Total Leave & Permission</th>
                <th className="border border-gray-400 px-4 py-2">Status</th>
                <th className="border border-gray-400 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayempLeaveHistory.map((leave) => (
                <tr key={leave._id}>
                  <td className="border border-gray-400 px-4 py-2">{leave?.userDetails?.employeeid}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave?.userDetails?.fullname}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave?.employeeDetails?.role}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.leaveType}-{leave.permissionType} </td>
                  <td className="border border-gray-400 px-4 py-2">{leave?.reason}</td>
                  <td className="border border-gray-400 px-4 py-2">{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.totalDays}</td>
                  <td className="border border-gray-400 px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded ${
                        leave.status === 'Approved'
                            ? 'bg-green-500 text-white'
                            : leave.status === 'Rejected'
                            ? 'bg-red-500 text-white'
                            : leave.status === 'Cancelled'
                            ? 'bg-blue-500 text-white'
                            : 'bg-yellow-500 text-white'
                    }`}
                >
                    {leave.status}
                </span>
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <div className="flex space-x-4">
                    {leave.status !== 'Approved' && leave.status !== 'Rejected' && leave.status !== 'Cancelled' && (
                      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={() => handleApprove(leave._id)}>Approve</button>)}
                      {leave.status !== 'Approved' && leave.status !== 'Rejected' && leave.status !== 'Cancelled' && (
                      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => handleReject(leave._id)}>Reject</button>)}
                      {leave.status === 'Approved' && new Date(leave.endDate) && new Date(leave.startDate)>= new Date() && (
                      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => handleCancel(leave._id)}>Cancel</button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <p>No pending leave requests.</p>
          )}
          </div>
        )}

        </div>
      </div>
   
  );
}

export default Dashboard;
