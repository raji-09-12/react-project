import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './AdminSidebar';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set state for editable fields
  
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  // Fetch user profile data when the component mounts
  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }

    // Fetch user profile data from backend
    axios.get(`${process.env.REACT_APP_API_URL}admin-profile`, {
      headers: {
        'Authorization': `Bearer ${token}` // Send token to backend to authenticate
      }
    })
    .then(response => {
      setUserData(response.data); // Assuming response contains user profile

      // Prepopulate editable fields with existing data
      
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

    // Prepare the updated user profile data
    const updatedData = {
      
      profilePic
    };

    // Send the updated profile to the backend
    axios.put(`${process.env.REACT_APP_API_URL}profile`, updatedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setSuccess('Profile updated successfully!');
      setError('');
      setUserData(response.data); // Update local state with the response data
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
      setProfilePic(response.data.fileUrl);  // Update profile picture after upload
      setSuccess('Profile picture updated successfully!');
    })
    .catch(error => {
      setError('Error uploading profile picture');
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
    <Sidebar handleLogout={handleLogout} />  
    <div className="flex-1 p-6 ml-64">
      <div className="flex w-full max-w-lg sm:max-w-md bg-white shadow-lg rounded-lg overflow-hidden mx-auto">
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

              <div className="mb-4 text-center">
                <img
                  src={profilePic}  // Fallback to default if no picture
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
                <p className="text-xl font-bold text-gray-600 mb-4">Mobile Number :<span className="text-gray-800  text-xl"> {userData.mobileno}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Gender :<span className="text-gray-800  text-xl"> {userData.gender}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Address :<span className="text-gray-800  text-xl"> {userData.address}</span></p>
                <p className="text-xl font-bold text-gray-600 mb-4">Email :<span className="text-gray-800  text-xl"> {userData.email}</span></p>
                </div>
              
              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
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
