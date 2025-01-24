// AdminEmployeeList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './AdminSidebar';

function AdminEmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login'; // Redirect to login page if no token is found
      return;
    }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const activeEmployees = response.data.filter((employee) => employee.status === 'active'); // Only show active employees
        setEmployees(activeEmployees);
      } catch (error) {
        setError('Error fetching employee details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, []);


  

  const handleDelete = async (employeeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
    if (confirmDelete) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}employees/${employeeId}`, 
          { status: 'inactive' },
          {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.status === 200) {
          // Remove employee from the list after successful deletion
          setEmployees(employees.filter((employee) => employee._id !== employeeId));
          alert('Employee removed from the list.');
        } else {
          console.log('Failed to delete employee:', response);
          setError('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Error deleting employee');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      
        <Sidebar handleLogout={handleLogout} />
     
     <div className="main-content flex-1 ml-64 p-6 ">
      <div className="w-full max-w-xl sm:max-w-md lg:max-w-7xl bg-white p-6 shadow-lg rounded-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Employee Details</h2>
      <div className="text-right mb-4">
        <button 
          //onClick={handleAddEmployee} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-800"
        ><a href="/admin-addemployee" >
          Add Employee
          </a>
        </button>
      </div>
      <div className="mb-4 text-lg font-semibold text-gray-700">
            Total Employees: {employees.length}
          </div>

      <table>
        <thead>
          <tr className="w-full border-collapse border border-gray-400">
            <th className="border border-gray-400 px-4 py-2">Employee ID</th>
            <th className="border border-gray-400 px-4 py-2">Full Name</th>
            <th className="border border-gray-400 px-4 py-2">Department</th>
            <th className="border border-gray-400 px-4 py-2">Role</th>
            <th className="border border-gray-400 px-4 py-2">Date of Joining</th>
            <th className="border border-gray-400 px-4 py-2">Mobile NO</th>
            <th className="border border-gray-400 px-4 py-2">Email</th>
            <th className="border border-gray-400 px-4 py-2">Gender</th>
            <th className="border border-gray-400 px-4 py-2">Address</th>
            <th className="border border-gray-400 px-4 py-2">Actions</th>
            
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td className="border border-gray-400 px-4 py-2">{employee.employeeid}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.fullname}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.department || 'N/A'}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.role || 'N/A'}</td>
              <td className="border border-gray-400 px-4 py-2"> {new Date(employee.dateOfJoining).toLocaleDateString('en-CA')} </td>
              <td className="border border-gray-400 px-4 py-2">{employee.mobileno}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.email}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.gender}</td>
              <td className="border border-gray-400 px-4 py-2">{employee.address}</td>
              <td className="border border-gray-400 px-4 py-2">
                  <FontAwesomeIcon
                      icon={faEdit}
                      className="text-green-500 cursor-pointer mr-3 hover:text-green-600"
                     // onClick={() => handleEdit(employee._id)} // Redirect to Edit page
                     onClick={() => navigate(`/admin-edit-employee/${employee._id}`)}
                  />
              
                  <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-500 cursor-pointer hover:text-red-600"
                      onClick={() => handleDelete(employee._id)}
                  />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      </div>
    </div>
  );
}

export default AdminEmployeeList;
