import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns'; // For manipulating the date range
import { enUS } from 'date-fns/locale';  // Import the locale
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

function AdminViewLeave() {
  const [leaveHistory, setLeaveHistory] = useState([]);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);
  
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      
      // Check the value
      

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}leave-history`, {
          
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLeaveHistory(response.data);
      } catch (error) {
        setError('Error fetching leave history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveHistory();
  }, []);
  
  const isDefaultDateRange = () => {
    const startDate = dateRange[0].startDate.toDateString();
    const endDate = dateRange[0].endDate.toDateString();
    const defaultStartDate = new Date().toDateString();
    const defaultEndDate = addDays(new Date(), 7).toDateString();

    return startDate === defaultStartDate && endDate === defaultEndDate;
  };

  const filteredLeaveHistory = leaveHistory.filter((leave) => {
    const leaveDate = new Date(leave.startDate);
    const isWithinRange =
      leaveDate >= dateRange[0].startDate && leaveDate <= dateRange[0].endDate;
    return isWithinRange;
  });

  const displayLeaveHistory = isDefaultDateRange() ? leaveHistory : filteredLeaveHistory;

  const totalLeaveCount = leaveHistory.filter((leave) => 
    leave.leaveType?.toLowerCase() === 'leave'
  ).length;

  const totalPermissionCount = leaveHistory.filter((leave) => 
    leave.leaveType?.toLowerCase() === 'permission'
  ).length;

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6">
        <div className="w-full bg-white p-6 shadow-lg rounded-lg">
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
          {/* Reset Filter Button */}
          <button
            onClick={() => setDateRange([{
              startDate: new Date(),
              endDate: addDays(new Date(), 7),
              key: 'selection',
            }])}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Show All Leave
          </button>
          <div className="mb-6 text-lg font-semibold text-gray-700">
            <p>Total Leaves: {totalLeaveCount}</p>
            <p>Total Permissions: {totalPermissionCount}</p>
            
          </div>
          <table>
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">Employee ID</th>
                <th className="border border-gray-400 px-4 py-2">Employee Name</th>
                <th className="border border-gray-400 px-4 py-2">Leave Type</th>
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
                  <td className="border border-gray-400 px-4 py-2">{leave.leaveType}</td>
                  <td className="border border-gray-400 px-4 py-2">{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td className="border border-gray-400 px-4 py-2">{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.totalDays}</td>
                  <td className="border border-gray-400 px-4 py-2">{leave.status}</td>
                  <td className="border border-gray-400 px-4 py-2">
                    <div className="flex space-x-4">
                      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={() => handleApprove(leave._id)}>Approve</button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => handleReject(leave._id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminViewLeave;
