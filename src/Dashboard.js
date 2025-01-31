import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './EmployeeSidebar';

function Dashboard() {
  const navigate = useNavigate();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [userData, setUserData] = useState(null);
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
      setUserData(response.data); // Assuming response contains user profile

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;


  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} role={userData.role} />

      {/* Main Content */}
      <div className="ml-64 p-14 w-full">
        <h2 className="text-5xl text-center font-bold mb-4">Welcome  {userData.fullname} </h2>
        

       
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
        
        

        </div>
      </div>
   
  );
}

export default Dashboard;
