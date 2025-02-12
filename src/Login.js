import React, { useState } from 'react';
//mport { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';  // Import the CSS file
import axios from 'axios';

function Login() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
    const [isSubmitting, setIsSubmitting] = useState(false);
    //const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}login`, { 
                employeeid: employeeId, 
                password:password, 
            });
            console.log(response.data);
            localStorage.setItem('token', response.data.token); // Store token in localStorage
            if (employeeId === 'admin123') {
                // Redirect to admin dashboard
                window.location.href = '/admin-dashboard'; 
            } else {
                // Redirect to user dashboard
                window.location.href = '/dashboard'; 
            }
            alert('Login successful!');
           // alert('Login successful!');
            
            //navigate('/profile'); // Redirect to the Profile page
           // window.location.href = '/dashboard';
        } catch (error) {
            setError(error.response?.data.message || 'Login failed');
        }finally {
            setIsSubmitting(false);
        }
    };
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);

    };

    return (
        

        <div className="flex items-center justify-center h-screen bg-gray-100">

            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden ">
               
                {/* Left Side - Image */}
                <div className="md:w-1/2 bg-white-800 flex justify-center items-center p-3">
                    <img 
                        src="/assets/emplogin.jpg" 
                        alt="Employee" 
                        className="w-full max-w-[500px] object-cover rounded-md"
                    />
                </div>

                {/* Right Side - Login Form */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome </h3>
                    

                    <h2 className="mb-6 text-2xl font-bold text-gray-800">Sign In</h2>
                    

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="error-message mb-4 text-sm text-red-500 text-center">{error}</div>}

                        {/* Employee ID input */}
                        <div className="input-group mb-4">
                            <label htmlFor="employeeId" className="block mb-2 text-left text-gray-700">Employee ID</label>
                            <input
                                type="text"
                                id="employeeId"
                                className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter your Employee ID"
                                required
                            />
                        </div>

                        {/* Password input */}
                        <div className="input-group mb-4 relative">
                            <label htmlFor="password" className="block mb-2 text-left text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    id="password"
                                    className="w-full pr-12 border-2 border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-600 text-xl"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        {/* Terms and Privacy Checkbox */}
                        <div className="mb-4 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={() => setTermsAccepted(!termsAccepted)}
                                className="h-4 w-4 rounded-sm cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                I agree to the <a href="/terms" className="text-blue-500 hover:underline">Terms</a> and <a href="/privacy" className="text-blue-500 hover:underline">Privacy</a>
                            </label>
                        </div>

                        {/* Login button */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting }
                            className={`w-full py-2 text-white rounded-lg ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <div className="signup-link text-center mt-4 text-sm">
                        Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign up free</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
