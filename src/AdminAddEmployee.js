import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';  // Import Sidebar

function AddEmployee() {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [subRole, setSubRole] = useState(''); 
  const [department, setDepartment] = useState('');
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch team leaders from the backend
    const fetchTeamLeaders = async () => {
      if (!department) {
        setTeamLeaders([]); // Clear leaders if no department selected
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}team-leaders?department=${department}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTeamLeaders(response.data); // Set the fetched team leaders
      } catch (error) {
        console.error('Error fetching team leaders:', error);
      }
    };

    fetchTeamLeaders();
  }, [department]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    

    if (!employeeId || !fullName || !role || !department ) {
      setError('All fields are required');
      return;
    }

    const employee = {
        employeeid: employeeId,
        fullname: fullName,
        role: role,
        department: department,
        assignedTeamLeader: role === 'Employee' ? subRole : null,
        

    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}add-basic`,
        employee,
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
    <div className="flex-1 p-6">
      <div className="w-full max-w-lg bg-white md:p-6 shadow-lg rounded-lg mx-auto">
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
          <div className="input-group mb-4">
              <label htmlFor="department" className="block text-lg font-medium">Department</label>
              <select
                id="department"
                className="w-full p-2 border border-gray-300 rounded"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                
                <option value="IT">IT</option>
                <option value="BPO">BPO</option>
              </select>
            </div>
          <div className="input-group mb-4">
              <label htmlFor="role" className="block text-lg font-medium">Role</label>
              <select
                id="role"
                className="w-full p-2 border border-gray-300 rounded"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                
                <option value="Manger">Manager</option>
                <option value="Department Leader">Department Leader</option>
                <option value="TeamLeader">Team Leader</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            {role === 'Employee' && (
              <div>
                <label className="block text-lg font-medium">Assign Team Leader</label>
                <select
                  value={subRole}
                  onChange={(e) => setSubRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Team Leader</option>
                  {teamLeaders.map((leader) => (
                    <option key={leader.employeeid} value={leader.fullname}>
                      {leader.fullname}
                    </option>
                  ))}
                </select>
              </div>
            )}
          <button 
              type="submit" 
              disabled={isSubmitting }
              className={`w-full py-2 text-white rounded-lg ${
                  isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
              {isSubmitting ? 'Adding...' : 'Add Employee'}
          </button>
          
        </form>
      </div>
      </div>
    </div>
  );
}

export default AddEmployee;
