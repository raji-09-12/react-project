import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';

function EmployeeProfile() {
  const { id } = useParams(); // Get the employee ID from the URL
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirect if no token
      return;
    }
    console.log('Employee ID:', id);
    
    axios.get(`${process.env.REACT_APP_API_URL}admin-edit-employee/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setEmployee(response.data);
      console.log('Employee Name:', response.data.fullname);
      
    })
    .catch(error => {
      console.error('Error fetching employee profile:', error);
      
      
    });
  }, [id]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 ml-64">
        <div className="flex w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden mx-auto">
          <div className="w-full p-7 flex flex-col justify-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Profile</h2>
              
              {/* Employee Details */}
              <div className="input-group mb-4">
              <div className="mb-4 text-center">
                <img
                src={employee.profilePic || '/default-profile.png'} // Use the profile picture URL or fallback to a default image
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-2"
                />
             </div>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Full Name: <span className="text-gray-800 text-xl">{employee.fullname}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Employee ID: <span className="text-gray-800 text-xl">{employee.employeeid}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Date of Joining: <span className="text-gray-800 text-xl">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().slice(0, 10) : ''}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Department: <span className="text-gray-800 text-xl">{employee.department}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Role: <span className="text-gray-800 text-xl">{employee.role}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Team Leader: <span className="text-gray-800 text-xl">{employee.assignedTeamLeader}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Mobile Number: <span className="text-gray-800 text-xl">{employee.mobileno}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Gender: <span className="text-gray-800 text-xl">{employee.gender}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Address: <span className="text-gray-800 text-xl">{employee.address}</span>
                </p>
                <p className="text-xl font-bold text-gray-600 mb-4">
                  Email: <span className="text-gray-800 text-xl">{employee.email}</span>
                </p>
              </div>

              {/* Save Changes Button */}
              
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
