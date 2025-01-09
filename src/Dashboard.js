import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './EmployeeSidebar';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [totalLeave, setTotalLeave] = useState(0);
  const [totalPermission, setTotalPermission] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
    axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
       
        setTotalLeave(response.data.totalLeave);
        setTotalPermission(response.data.totalPermission);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;


  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="ml-64 p-14 w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to  {userData.fullname}</h2>
        

        {/* Display total leave and total permission */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800">Total Leave</h3>
            <p className="text-2xl font-bold text-gray-600">{totalLeave}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border border-pink-300">
            <h3 className="text-xl font-semibold text-gray-800 ">Total Permission</h3>
            <p className="text-2xl font-bold text-gray-600">{totalPermission}</p>
          </div>
        </div>

        </div>
      </div>
   
  );
}

export default Dashboard;
