import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './EmployeeSidebar';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns'; // For manipulating the date range
import { enUS } from 'date-fns/locale'; // Import the locale
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file


const ViewLeaveApplications = () => {
    const { userData } = useContext(UserContext);
    const [leave, setLeave] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection',
        },
    ]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
          navigate('/login' );
        }
      }, [navigate]);
    

    useEffect(() => {
        const fetchLeave = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("User not logged in.");
                return;
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}view-leave`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (Array.isArray(response.data.data)) {
                    setLeave(response.data.data);
                } else {
                    console.error("Expected an array of leave applications");
                }
            } catch (error) {
                console.error("Error fetching leave applications:", error);
                setError("Failed to fetch leave applications.");
            }
        };

        fetchLeave();
    }, []);

    const isDefaultDateRange = () => {
        const startDate = dateRange[0].startDate.toDateString();
        const endDate = dateRange[0].endDate.toDateString();
        const defaultStartDate = new Date().toDateString();
        const defaultEndDate = addDays(new Date(), 7).toDateString();

        return startDate === defaultStartDate && endDate === defaultEndDate;
    };

    

    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const filteredLeave = leave.filter((leave) => {
  const leaveStartDate = normalizeDate(new Date(leave.startDate)); // Normalize the leave's startDate
  const leaveEndDate = normalizeDate(new Date(leave.endDate || leave.startDate)); // Handle single-day leave
  const startDate = normalizeDate(dateRange[0].startDate); // Normalize the range start date
  const endDate = normalizeDate(dateRange[0].endDate); // Normalize the range end date

  // Check if the leave falls within the date range (either start or end date overlaps)
  const isWithinRange =
    (leaveStartDate <= endDate && leaveEndDate >= startDate); // This checks if any part of the leave overlaps the range

  return isWithinRange;
});


    const displayLeave = isDefaultDateRange() ? leave : filteredLeave;

    

    const handleEdit = (leaveId) => {
        navigate(`/edit-leave/${leaveId}`);
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
            setLeave(leave.map((leave) =>
                leave._id === leaveId ? { ...leave, status: 'Cancelled',statusReason } : leave
            ));
    
            setError(''); // Clear any previous errors
        } catch (error) {
            console.error("Error cancelling leave:", error);
            setError("Failed to cancel leave.");
        }
    };
    

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar handleLogout={handleLogout} role={userData?.role}/>

            {/* Main Content */}
            <div className="main-content flex-1 md:ml-64 transition-all duration-300  md:p-6">
                <div className="w-full max-w-fit lg:max-w-fit bg-white p-6 shadow-lg rounded-lg mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-4">Leave History</h2>
                    <DateRangePicker
                        onChange={(item) => setDateRange([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        ranges={Array.isArray(dateRange) ? dateRange : []}
                        editableDateInputs={true}
                        rangeColors={['#3f51b5']}
                        locale={enUS}
                    />
                    <button
                        onClick={() =>
                            setDateRange([
                                {
                                    startDate: new Date(),
                                    endDate: addDays(new Date(), 7),
                                    key: 'selection',
                                },
                            ])
                        }
                        className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
                    >
                        Show All Leave
                    </button>

                    {/* Error Message */}
                    {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

                    {/* Leave Applications Table */}
                    {displayLeave.length > 0 ? (
                        <>
                       <div className="hidden md:block mt-8 bg-white shadow-lg rounded-lg p-6">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-400 px-4 py-2">Leave Type</th>
                                    <th className="border border-gray-400 px-4 py-2">Reason</th>
                                    <th className="border border-gray-400 px-4 py-2">Session</th>
                                    <th className="border border-gray-400 px-4 py-2">Status</th>
                                    <th className="border border-gray-400 px-4 py-2">Status Reason</th>
                                    <th className="border border-gray-400 px-4 py-2">Start Date</th>
                                    <th className="border border-gray-400 px-4 py-2">End Date</th>
                                    <th className="border border-gray-400 px-4 py-2">Total Leave</th>
                                    <th className="border border-gray-400 px-4 py-2">Edit</th>
                                
                                    <th className="border border-gray-400 px-4 py-2">Cancel</th>

                                </tr>
                            </thead>
                            <tbody>
                                {displayLeave.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-100">
                                        <td className="border border-gray-400 px-4 py-2">{leave.leaveType}</td>
                                        <td className="border border-gray-400 px-4 py-2">{leave.reason}</td>
                                        <td className="border border-gray-400 px-4 py-2">{leave.permissionType} {leave.halfDayOption}</td>
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
                                        <td className="border border-gray-400 px-4 py-2">{leave.statusReason ||'N/A'}</td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">{leave.totalDays}</td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            {leave.status !== 'Approved' && leave.status !== 'Rejected' && leave.status !== 'Cancelled' && (
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                    className="text-green-500 cursor-pointer mr-3 hover:text-green-600"
                                                    onClick={() => handleEdit(leave._id)}
                                                />
                                            )}
                                        </td>
                                        
                                        <td className="border border-gray-400 px-4 py-2">
                                            {leave.status !== 'Approved' && leave.status !== 'Rejected'&& leave.status !== 'Cancelled' &&
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                    onClick={() => handleCancel(leave._id)}
                                                >
                                                    Cancel
                                                </button>
                                            }
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <div className="md:hidden space-y-4">
                        {displayLeave.map((leave) => (
                            <div key={leave._id} className="bg-gray-100 rounded-lg p-4 shadow">
                            <p><strong>Leave Type:</strong> {leave.leaveType}</p>
                            <p><strong>Reason:</strong> {leave.reason}</p>
                            <p><strong>Session:</strong> {leave.permissionType}</p>
                            <p>
                            <strong>Status:</strong> 
                            <span
                                className={`ml-2 px-2 py-1 rounded ${
                                leave.status === 'Approved' ? 'bg-green-500 text-white' :
                                leave.status === 'Rejected' ? 'bg-red-500 text-white' :
                                leave.status === 'Cancelled' ? 'bg-blue-500 text-white' :
                                'bg-yellow-500 text-white'
                                }`}
                            >
                                {leave.status}
                            </span>
                            </p>
                            <p><strong>Status Reason:</strong> {leave.statusReason || 'N/A'}</p>
                            <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                            <p><strong>End Date:</strong> {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Total Days:</strong> {leave.totalDays}</p>
                            <div className="fled space x-4">
                                {leave.status !== 'Approved' && leave.status !== 'Rejected' && leave.status !== 'Cancelled' && (
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="text-green-500 cursor-pointer mr-3 hover:text-green-600"
                                        onClick={() => handleEdit(leave._id)}
                                    />
                                )}
                                {leave.status !== 'Approved' && leave.status !== 'Rejected'&& leave.status !== 'Cancelled' &&
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={() => handleCancel(leave._id)}
                                    >
                                        Cancel
                                    </button>
                                }
                            </div>
                            
                            </div>
                        ))}
                        </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">No leave applications found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewLeaveApplications;
