import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './EmployeeSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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
        //const response = await axios.get(`${process.env.REACT_APP_API_URL}leader-view-leave-history`, {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}leave-history`, {
          
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const allLeave = response.data;
      const leaderDepartment = userData?.department || "";
      const userRole = userData?.role || ""; 
      //const assignedTeamLeader = userData?.assignedTeamLeader;

      let departmentLeave = [];

      
      if (userRole === "TeamLeader") {
        
        departmentLeave = allLeave.filter(
          (leave) => 
            leave.userId.employeeInfoId?.department === leaderDepartment && 
            leave.userId.employeeInfoId?.role === "Employee" &&
            leave.userId.employeeInfoId?.assignedTeamLeader === userData.fullname
            //(assignedTeamLeader ? leave.userId.employeeInfoId?.assignedTeamLeader === assignedTeamLeader : true)
        );
      
      }else if (userRole === "Department Leader") {
        
        departmentLeave = allLeave.filter(
          (leave) => 
            leave.userId.employeeInfoId?.department === leaderDepartment && 
            leave.userId.employeeInfoId?.role !== "Department Leader"
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

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const today = new Date();
const todayNormalized = normalizeDate(today);  

const todayLeaveData = empleaveHistory.filter((leave) => {
  
  const leaveStartDate = normalizeDate(new Date(leave.startDate));  
  const leaveEndDate = normalizeDate(new Date(leave.endDate || leave.startDate));  

 
  return (
    todayNormalized >= leaveStartDate && 
    todayNormalized <= leaveEndDate &&
    leave.status === 'Approved'   
     
  );
});

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


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

 
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} role={userData?.role} />

      {/* Main Content */}
      <div className="main-content flex-1 ml-0 md:ml-64 transition-all duration-300  md:p-14 w-full">
      <div className="w-full max-w-fit lg:max-w-fit  p-6 shadow-lg rounded-lg mx-auto">
        <h2 className="text-5xl text-center font-bold mb-4">Welcome  {userDataa.fullname} </h2>
        

       
        {/* Display total leave and total permission */}
        <div className="mt-6 grid lg:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-6 overflow-x-auto">
          
          
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Leave Request: {totalLeave} </h3>

            {/* Container for the column layout */}
            <div className="flex flex-col gap-4 grid lg:grid-cols-5 sm:grid-cols-5">
              
            <div className="bg-gray-100 shadow-sm rounded-lg p-8 border border-gray-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Days</p> <span className="text-gray-800 text-4xl">{totalLeaveDays}</span>
            </div>

              <div className="bg-yellow-100 shadow-sm rounded-lg p-8 border border-yellow-300 flex flex-col justify-center items-center ">
                <p className="text-l font-bold text-gray-600 mb-4">Pending</p> <span className="text-gray-800  text-4xl">{totals.totalPendingLeave}</span>
              </div>
              <div className="bg-green-100 shadow-sm rounded-lg p-8 border border-green-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Approved </p><span className="text-gray-800 text-4xl"> {totals.totalApprovedLeave}</span>
              </div>
              <div className="bg-red-100 shadow-sm rounded-lg p-8 border border-red-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Rejected </p><span className="text-gray-800 text-4xl">{totals.totalRejectedLeave}</span>
              </div>
              <div className="bg-blue-100 shadow-sm rounded-lg p-8 border border-blue-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Cancelled </p><span className="text-gray-800 text-4xl">{totals.totalCancelledLeave}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-3xl font-semibold text-center text-gray-1000 mb-8">Permission Request: {totalPermission} </h3>

            {/* Container for the column layout */}
            <div className="flex flex-col gap-4 grid lg:grid-cols-5 sm:grid-cols-5">
              
            <div className="bg-gray-100 shadow-sm rounded-lg p-8 border border-gray-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Permission</p> <span className="text-gray-800 text-4xl">{totalPermissionDays}</span>
            </div>

              <div className="bg-yellow-100 shadow-sm rounded-lg p-8 border border-yellow-300 flex flex-col justify-center items-center ">
                <p className="text-l font-bold text-gray-600 mb-4">Pending</p> <span className="text-gray-800  text-4xl">{totals.totalPendingPermission}</span>
              </div>
              <div className="bg-green-100 shadow-sm rounded-lg p-8 border border-green-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Approved </p><span className="text-gray-800 text-4xl"> {totals.totalApprovedPermission}</span>
              </div>
              <div className="bg-red-100 shadow-sm rounded-lg p-8 border border-red-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Rejected </p><span className="text-gray-800 text-4xl">{totals.totalRejectedPermission}</span>
              </div>
              <div className="bg-blue-100 shadow-sm rounded-lg p-8 border border-blue-300 flex flex-col justify-center items-center">
                <p className="text-l font-bold text-gray-600 mb-4">Cancelled </p><span className="text-gray-800 text-4xl">{totals.totalCancelledPermission}</span>
              </div>
            </div>
          </div>          
        </div>

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

        {userData?.role !== "Employee" && (  
          
        <div className="w-full p-6 shadow-lg rounded-lg bg-white mx-auto mt-6">
          <h2 className="text-2xl font-bold text-left mb-4">Pending Leave Request
          </h2>
          {displayempLeaveHistory.length > 0 ? (
          <>
          <div className="hidden md:block mt-8 bg-white shadow-lg rounded-lg p-6">
          <table className ="w-full">
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
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.employeeid}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.fullname}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.employeeInfoId?.role}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.leaveType}-{leave.permissionType} </td>
                  <td className="border border-gray-400 px-4 py-2">{leave.reason}</td>
                  <td className="border border-gray-400 px-4 py-2">{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.totalDays}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.status}</td>                            
                  <td className="border border-gray-400 px-4 py-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 cursor-pointer mr-1 hover:text-green-600"
                    size="2x"
                    onClick={() => handleApprove(leave._id)}                        
                  />                                              
                  <FontAwesomeIcon
                    icon={faTimesCircle  }
                    className="text-red-500 cursor-pointer mr-1 hover:text-red-600"
                    size="2x"
                    onClick={() => handleReject(leave._id)}
                  />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="md:hidden space-y-4">
          {displayempLeaveHistory.map((leave) => (
            <div key={leave._id} className="bg-gray-100 rounded-lg p-4 shadow">
              <p><strong>Employee ID:</strong> {leave.userId.employeeid}</p>
              <p><strong>Employee Name:</strong> {leave.userId.fullname}</p>
              <p><strong>Leave Type:</strong> {leave.leaveType}-{leave.permissionType}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Total Days:</strong> {leave.totalDays}</p>
              <p><strong>Status:</strong> {leave.status}</p>
              <div className="flex space-x-2 mt-2">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 cursor-pointer mr-1 hover:text-green-600"
                size="2x"
                onClick={() => handleApprove(leave._id)}                        
              />                                              
              <FontAwesomeIcon
                icon={faTimesCircle  }
                className="text-red-500 cursor-pointer mr-1 hover:text-red-600"
                size="2x"
                onClick={() => handleReject(leave._id)}
              />
              </div>
            </div>
          ))}
        </div>
          </>
          ) : (
            <p>No pending leave requests.</p>
          )}
          </div>
        )}

        </div>
        </div>
      </div>
   
  );
}

export default Dashboard;
