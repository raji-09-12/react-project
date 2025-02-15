import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './EmployeeSidebar';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns'; // For manipulating the date range
import { enUS } from 'date-fns/locale';  // Import the locale
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

function LeaderViewLeave() {
  const { userData } = useContext(UserContext);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredLeaveHistory, setFilteredLeaveHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showReport, setShowReport] = useState(false);

  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }
      
      // Check the value
      

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
           // (assignedTeamLeader ? leave.userId.employeeInfoId?.assignedTeamLeader === assignedTeamLeader : true)
        );
      
      }else if (userRole === "Department Leader") {
        
        departmentLeave = allLeave.filter(
          (leave) => 
            leave.userId.employeeInfoId?.department === leaderDepartment && 
            leave.userId.employeeInfoId?.role !== "Department Leader"
        );
      }

      setLeaveHistory(departmentLeave);
      } catch (error) {
        setError('Error fetching leave history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveHistory();
  }, [userData]);

  
  
  const handleShowAllLeave = () => {
    setFilteredLeaveHistory([]); // Clear the filtered history
    setIsFiltered(false); // Reset the filter flag
    setShowReport(false);
    setDateRange([{
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    }]); // Reset the date range to the default range
    console.log("Applied Dates for Leave:");
    leaveHistory
    .forEach((leave) => {
      console.log({
        employeeId: leave.userDetails?.employeeid || "N/A",
        employeeName: leave.userDetails?.fullname || "N/A",
        appliedDate: new Date(leave.appliedDate).toLocaleDateString(),
      });
    });
  };

  
  const groupedLeaveHistory = filteredLeaveHistory.reduce((acc, leave) => {
    const employeeId = leave.userDetails.employeeid;
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employeeId,
        employeeName: leave?.userDetails?.fullname,
        totalLeaveDays: 0,
        totalPermissions: 0,
      };
    }
    if (leave.leaveType?.toLowerCase() === 'leave') {
      acc[employeeId].totalLeaveDays += leave.totalDays || 0;
    } else if (leave.leaveType?.toLowerCase() === 'permission') {
      acc[employeeId].totalPermissions += leave.totalDays || 0;
    }
    return acc;
  }, {});
  
  const reportData = Object.values(groupedLeaveHistory); // Convert grouped object to array
  


  const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

 
  
  const filteredLeaveHistoryData = leaveHistory.filter((leave) => {
    // Normalize the leave's start and end dates
    const leaveStartDate = normalizeDate(new Date(leave.startDate));
    const leaveEndDate = normalizeDate(new Date(leave.endDate || leave.startDate)); // Handle single-day leave
  
    // Check if today is within the leave date range (inclusive)
    const rangeStart = normalizeDate(dateRange[0].startDate);
    const rangeEnd = normalizeDate(dateRange[0].endDate);
  
    return (
      leaveStartDate <= rangeEnd &&
      leaveEndDate >= rangeStart &&
       leave.status === 'Approved'   
      
    );
  });
  

  const handleViewLeave = () => {
    const filteredData = filteredLeaveHistoryData;
    setFilteredLeaveHistory(filteredData); // Update filtered data
    setIsFiltered(true);
    setShowReport(filteredData.length > 0); // Show report only if data exists
  };


const displayLeaveHistory = isFiltered ? filteredLeaveHistory : leaveHistory;

  

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
        setLeaveHistory((prevState) =>
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
        await axios.put(`${process.env.REACT_APP_API_URL}cancel-leave/${leaveId}`, { reason: statusReason }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Update the leave's status in the state
        setLeaveHistory(leaveHistory.map((leave) =>
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
    <div className="flex ">
      <Sidebar handleLogout={handleLogout} role={userData?.role}  />
      <div className="main-content flex-1 md:ml-64 transition-all duration-300 md:p-6">
        <div className="w-full max-w-xl sm:max-w-md lg:max-w-7xl bg-white p-6 shadow-lg rounded-lg mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Employee Leave History</h2>
          <DateRangePicker
            onChange={(item) => setDateRange([item.selection])}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            ranges={Array.isArray(dateRange) ? dateRange : []}
            editableDateInputs={true}
            rangeColors={['#3f51b5']}
            locale={enUS}  // Pass the locale
          />
          {/* View Leave Button */}
          <button
            onClick={handleViewLeave}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            View Leave
          </button>
          {/* Reset Filter Button */}
          <button
            onClick={handleShowAllLeave}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Show All Leave
          </button>
          


          {showReport && reportData.length > 0 &&   (
          <div className="w-full bg-white p-6 shadow-lg rounded-lg mt-6">
            <h2 className="text-2xl font-bold text-left mb-4">Leave Report</h2>
            <table>
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-4 py-2">Employee ID</th>
                  <th className="border border-gray-400 px-4 py-2">Employee Name</th>
                  <th className="border border-gray-400 px-4 py-2">Total Leave Days</th>
                  <th className="border border-gray-400 px-4 py-2">Total Permissions</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td className="border border-gray-400 px-4 py-2">{employee.employeeId}</td>
                    <td className="border border-gray-400 px-4 py-2">{employee.employeeName}</td>
                    <td className="border border-gray-400 px-4 py-2">{employee.totalLeaveDays}</td>
                    <td className="border border-gray-400 px-4 py-2">{employee.totalPermissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

          {/*<div className="mb-6 text-lg font-semibold text-gray-700">
            <p>Total Leave Request: {totalLeaveCount}</p>
            <p>Total Permissions: {totalPermissionCount}</p>
            <p>Total Leave Days: {totalLeaveDays}</p>
            
          </div> */}
          {displayLeaveHistory.length > 0 ? (
          <div className="w-full bg-white p-6 shadow-lg rounded-lg mt-6">
          <h2 className="text-2xl font-bold text-left mb-4">Day-Wise Leave Report</h2>
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
              {displayLeaveHistory.map((leave) => (
                <tr key={leave._id}>
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.employeeid}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.fullname}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.userId.employeeInfoId?.role}</td>
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
                      {
                      leave.status === 'Approved' && (    
                        (new Date(leave.endDate).setHours(23, 59, 59, 999) >= new Date().setHours(23, 59, 59, 999)) || 
                        (leave.endDate === null && new Date(leave.startDate).setHours(23, 59, 59, 999) >= new Date().setHours(23, 59, 59, 999))
                      ) && (
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => handleCancel(leave._id)}>
                          Cancel
                        </button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          </div>
          ) : (
            <p className="text-center text-gray-500">No leave applications found.</p>
        )}
        </div>
      </div>
    </div>
  );
}

export default LeaderViewLeave;
