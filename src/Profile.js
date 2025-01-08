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
    axios.get('http://localhost:5001/profile', {
      headers: {
        'Authorization': `Bearer ${token}` // Send token to backend to authenticate
      }
    })
    .then(response => {
      setUserData(response.data); // Assuming response contains user profile

      // Prepopulate editable fields with existing data
      setEmail(response.data.email);
      setGender(response.data.gender);
      setAddress(response.data.address);
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
      email,
      gender,
      address
    };

    // Send the updated profile to the backend
    axios.put('http://localhost:5001/profile', updatedData, {
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />
    <div className="flex-1 p-6">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
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
              {/* Full Name */}
              <div className="input-group mb-4">
                <label htmlFor="fullName" className="block mb-2 text-left text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userData.fullname}
                  readOnly
                />
              </div>

              {/* Employee ID */}
              <div className="input-group mb-4">
                <label htmlFor="fullName" className="block mb-2 text-left text-gray-700">Employee Id</label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userData.employeeid}
                  readOnly
                />
              </div>

              {/* Mobile Number */}
              <div className="input-group mb-4">
                <label htmlFor="fullName" className="block mb-2 text-left text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userData.mobileno}
                  readOnly
                />
              </div>

              {/* Email */}
              <div className="input-group mb-4">
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

              {/* Gender */}
              <div className="input-group mb-4">
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

              {/* Address */}
              <div className="input-group mb-4">
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
