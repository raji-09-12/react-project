import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';

function Password() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for password match
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError(''); // Clear any previous error
        console.log('Passwords match, form submitted!');
        
        // Example of navigating to another page after successful form submission
        navigate('/dashboard');  // Change to your desired route after successful sign-up
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Password</h2>

                {/* Error Message */}
                {error && <div className="text-sm text-red-500 text-center mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password input */}
                    <div className="input-group mb-4">
                        <label htmlFor="password" className="block mb-2 text-left text-gray-700">Password</label>
                        <input
                            type="text"
                            id="password"
                            className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* Confirm Password input */}
                    <div className="input-group mb-4">
                        <label htmlFor="confirmPassword" className="block mb-2 text-left text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full p-1 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    {/* Submit button */}
                    <button 
                        type="submit" 
                        className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Password
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4 text-sm">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
                </div>
            </div>
        </div>
    );
}

export default Password;
