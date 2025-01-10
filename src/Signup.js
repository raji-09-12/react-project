import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fullName || !employeeId || !mobileNumber || !email || !gender || !address || !termsAccepted) {
      setError('Please fill in all fields and accept the terms.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const user = {
      fullname: fullName,
      employeeid: employeeId,
      mobileno: mobileNumber,
      password: password,
      confirmPassword: confirmPassword,
      email: email,
      gender: gender,
      address: address,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}register`, user, {
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Registration successful!');
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="w-1/2 bg-gray-100 flex justify-center items-center p-3">
          <img
            src="/assets/emplogin.jpg"
            alt="Employee"
            className="w-full max-w-[500px] object-cover rounded-md"
          />
        </div>

        <div className="w-1/2 p-7 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome</h3>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Create an Account</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="error-message mb-4 text-sm text-red-500 text-center">{error}</div>}

            <div className="input-group mb-4">
              <label htmlFor="fullName" className="block mb-2 text-left text-gray-700">Full Name</label>
              <input
                type="text"
                id="fullName"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="employeeId" className="block mb-2 text-left text-gray-700">Employee ID</label>
              <input
                type="text"
                id="employeeId"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your Employee ID"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="mobileNumber" className="block mb-2 text-left text-gray-700">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="email" className="block mb-2 text-left text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="gender" className="block mb-2 text-left text-gray-700">Gender</label>
              <input
                type="text"
                id="gender"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Enter your gender"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="address" className="block mb-2 text-left text-gray-700">Address</label>
              <input
                type="text"
                id="address"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="password" className="block mb-2 text-left text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="input-group mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 text-left text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-1 text-base border-2 border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="mb-4 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="h-4 w-4 rounded-sm cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the <a href="/terms" className="text-blue-500 hover:underline">Terms</a> and <a href="/privacy" className="text-blue-500 hover:underline">Privacy</a>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>

          <div className="login-link text-center mt-4 text-sm">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
