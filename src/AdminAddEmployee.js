import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';  // Import Sidebar

function AddEmployee() {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !fullName) {
      setError('Both Employee ID and Full Name are required');
      return;
    }

    const employee = {
        employeeid: employeeId,
        fullname: fullName,
        

    };

    try {
      const response = await axios.post(
        '${apiUrl}/add-basic',employee,
       // { employeeid, fullname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.status === 201) {
        navigate('/employees'); // Redirect to employee list page after success
      }
      alert('Employee Id Created successful!');
    } catch (error) {
      console.error('Error creating employee:', error);
      setError('Error creating employee. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar handleLogout={handleLogout} />   {/* Add Sidebar on the left side */}
      
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Add Employee</h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium">Employee ID</label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Add Employee
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;
