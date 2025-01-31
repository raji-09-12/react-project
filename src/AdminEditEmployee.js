import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';

function AdminEditEmployee() {
  const { id } = useParams(); // Get employee ID from the URL
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    fullname: '',
    email: '',
    gender: '',
    address: '',
    mobileno: '',
    dateOfJoining: '',
    role: '',
    department: '',
    assignedTeamLeader: '',
  });
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Employee ID:", id);

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }
    // Fetch employee details
    axios
      .get(`${process.env.REACT_APP_API_URL}admin-edit-employee/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) =>{
        console.log("Employee Data:", response.data);
        setEmployee(response.data);
      })
      .catch((err) => {
        console.error('Error fetching:', err);
        setError('Error fetching employee details')
      });
      // Fetch team leaders
      
  }, [id]);

  useEffect(() => {
    if (employee.department) {
      axios
        .get(`${process.env.REACT_APP_API_URL}team-leaders?department=${employee.department}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          console.log("Fetched Team Leaders:", response.data);
          setTeamLeaders(response.data);
        })
        .catch((err) => console.error("Error fetching team leaders:", err));
    }
  }, [employee.department]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`${process.env.REACT_APP_API_URL}admin-edit-employee/${id}`, employee, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        alert('Employee updated successfully!');
        navigate('/employees'); // Redirect back to the employee list
      })
      .catch((err) => {
        console.error('Error updating employee:', err);
        setError('Failed to update employee. Please try again.');
      });
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
    <Sidebar handleLogout={handleLogout} />  
    <div className="flex-1 p-6 ml-64">
      <div className="flex w-full max-w-lg sm:max-w-md bg-white shadow-lg rounded-lg overflow-hidden mx-auto">
        <div className="w-full p-7 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          name="fullname"
          value={employee.fullname}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        />
        <label>Department</label>
        <select
          name="department"
          value={employee.department}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        >
          <option value="">Select Department</option>
          <option value="IT">IT</option>
          <option value="BPO">BPO</option>
          
          {/* Add any other roles you need */}
        </select>
        <label>Role</label>
        <select
          name="role"
          value={employee.role}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        >
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Department Leader">Department Leader</option>
          <option value="TeamLeader">Team Leader</option>
          <option value="Employee">Employee</option>
          
          {/* Add any other roles you need */}
        </select>
        {employee.role === 'Employee' && (
          <div>
            <label>Assign Team Leader</label>
            <select
              name="assignedTeamLeader"
              value={employee.assignedTeamLeader}
              onChange={handleChange}
              className="block w-full p-2 border mb-4"
              required
            >
              <option value="">Select Team Leader</option>
              {teamLeaders.map((leader) => (
                <option key={leader._id} value={leader.fullname}>
                  {leader.fullname}
                </option>
              ))}
            </select>
          </div>
        )}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={employee.email}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        />
        <label>Gender</label>
        <select
          name="gender"
          value={employee.gender}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          
        </select>
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={employee.address}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        />
        <label>Mobile Number</label>
        <input
          type="text"
          name="mobileno"
          value={employee.mobileno}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        />
        <label>Date of Joining</label>
        <input
          type="text"
          name="dateOfJoining"
          value={employee.dateOfJoining}
          onChange={handleChange}
          className="block w-full p-2 border mb-4"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Update Employee
        </button>
      </form>
    </div>
    </div>
    </div>
    </div>
  );
}

export default AdminEditEmployee;
