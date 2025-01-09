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
      .get(`${process.env.REACT_APP_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUserData(response.data))
      .catch(() => setError('Error fetching profile data'));
  }, [navigate]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const employeeResponse = await axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEmployees(employeeResponse.data);

        const leaveResponse = await axios.get(`${process.env.REACT_APP_API_URL}/leave-history/:id`, {
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
  const totalLeaveCount = leaveHistory?.filter(
    (leave) => leave.leaveType?.toLowerCase() === 'leave'
  ).length || 0;
  
  const totalPermissionCount = leaveHistory?.filter(
    (leave) => leave.leaveType?.toLowerCase() === 'permission'
  ).length || 0;
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar handleLogout={handleLogout} />
      <div className="ml-64 p-14 w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to {userData?.fullname}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Employee</h3>
            <p className="text-2xl font-bold text-gray-600">{employees.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Leave</h3>
            <p className="text-2xl font-bold text-gray-600">{totalLeaveCount}</p>
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
      </div>
    </div>
  );
}

export default Dashboard;
