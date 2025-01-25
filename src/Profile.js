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
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
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
      setEmail(response.data.email);
      setGender(response.data.gender);
      setAddress(response.data.address);
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
      email,
      gender,
      address,
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
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 ml-64">
        <div className="flex w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden mx-auto">
          <div className="w-full p-7 flex flex-col justify-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Profile</h2>
            <div className="text-right mb-4">
              <button 
                //onClick={handleAddEmployee} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-800"
              ><a href="/emp-editprofile" >
                Edit Profile
                </a>
              </button>
            </div>

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

                {/* Fields in Grid layout */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fullName" className="block mb-2 text-left text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.fullname}
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="employeeId" className="block mb-2 text-left text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      id="employeeId"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.employeeid}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="dateOfJoining" className="block mb-2 text-left text-gray-700">Date of Joining</label>
                    <input
                      type="text"
                      id="dateOfJoining"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.dateOfJoining ? new Date(userData.dateOfJoining).toISOString().slice(0, 10) : ''}
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block mb-2 text-left text-gray-700">Department</label>
                    <input
                      type="text"
                      id="department"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.department}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="role" className="block mb-2 text-left text-gray-700">Role</label>
                    <input
                      type="text"
                      id="role"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.role}
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileno" className="block mb-2 text-left text-gray-700">Mobile Number</label>
                    <input
                      type="text"
                      id="mobileno"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={userData.mobileno}
                      readOnly
                    />
                  </div>
                </div>

                {/* Email and Gender */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-left text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block mb-2 text-left text-gray-700">Gender</label>
                    <select
                      id="gender"
                      className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label htmlFor="address" className="block mb-2 text-left text-gray-700">Address</label>
                  <textarea
                    id="address"
                    className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
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
