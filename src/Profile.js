import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './EmployeeSidebar';


function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  // Set state for editable fields
  const [profilePic, setProfilePic] = useState(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}profile`, {
      headers: {
        'Authorization': `Bearer ${token}` // Send token to backend to authenticate
      }
    })
    .then(response => {
      setUserData(response.data);
      setProfilePic(response.data.profilePic);
    })
    .catch(error => {
      console.error('Error fetching profile', error);
      setError('Error fetching profile data');
    });
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Unauthorized! Please log in again.');
      return;
    }

    const updatedData = {
    
      profilePic
    };

    axios.put(`${process.env.REACT_APP_API_URL}profile`, updatedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setSuccess('Profile updated successfully!');
      setError('');
      setUserData(response.data);
    })
    .catch(error => {
      console.error('Error updating profile', error);
      setError('Error updating profile data');
    });
  };

  const handleImageUpload = (e) => {
    const formData = new FormData();
    formData.append('profilePic', e.target.files[0]);

    const token = localStorage.getItem('token');
    axios.post(`${process.env.REACT_APP_API_URL}uploads`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      setProfilePic(response.data.fileUrl);
      setSuccess('Profile picture updated successfully!');
    })
    .catch(error => {
      setError('Error uploading profile picture');
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} role = {userData?.role}  />
      <div className="flex-1 p-6 ml-64">
        <div className="flex w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden mx-auto">
          <div className="w-full p-7 flex flex-col justify-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Profile</h2>
            
            {/* Error and Success messages */}
            {error && (
              <div className="error-message mb-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="success-message mb-4 text-sm text-green-500 text-center">
                {success}
              </div>
            )}

            {/* User Data */}
            {userData ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Profile Picture */}
                <div className="mb-4 text-center">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-gray-700"
                  />
                </div>

                <div className="input-group mb-4">
                <p className="text-xl font-bold text-gray-600 mb-4 ">Full Name :<span className="text-gray-800  text-xl"> {userData.fullname}</span></p> 
                <p className="text-xl font-bold text-gray-600 mb-4">Employee ID :<span className="text-gray-800  text-xl"> {userData.employeeid}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Date of Joining :<span className="text-gray-800  text-xl"> {userData.dateOfJoining ? new Date(userData.dateOfJoining).toISOString().slice(0, 10) : ''}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Department :<span className="text-gray-800  text-xl"> {userData.department}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Role  :<span className="text-gray-800  text-xl"> {userData.role}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Mobile Number :<span className="text-gray-800  text-xl"> {userData.mobileno}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Gender :<span className="text-gray-800  text-xl"> {userData.gender}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Address :<span className="text-gray-800  text-xl"> {userData.address}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Email :<span className="text-gray-800  text-xl"> {userData.email}</span></p>
                
                

                </div>
                <button
                  type="submit"
                  className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Save Changes
                </button>
                <div className="text-center mb-4">
                </div>


                
              </form>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
