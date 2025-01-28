import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ handleLogout, role }) => {
  console.log("Role:", role); 
  return (
    
    <div className="w-64 bg-gray-800 text-white p-6 fixed h-full left-0 top-0">
      <h2 className="text-xl font-bold mb-6">{role === 'TeamLeader' 
                                              ? 'Team Leader Panel' 
                                              : role === 'Department Leader' 
                                              ? 'Department Leader Panel' 
                                              : 'Employee Panel'}</h2>
      <a href = "/admin-dashboard"> </a>
      <ul>
        <li className="mb-4">
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-blue-700 rounded">
            Dashboard
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/profile" className="block py-2 px-4 hover:bg-blue-700 rounded">
            Profile
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/apply-leave" className="block py-2 px-4 hover:bg-blue-700 rounded">
          Apply Leave
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/view-leaves" className="block py-2 px-4 hover:bg-blue-700 rounded">
            Leave History
          </Link>
        </li>
         {/* Conditionally render the "Assign Employees" link for Team Leader only */}
         {(role === 'TeamLeader'  || role === 'Department Leader' )&&  (
          <li className="mb-4">
            <Link to="/leader-view-leave-history" className="block py-2 px-4 hover:bg-blue-700 rounded">
            Employees Leave History
            </Link>
          </li>
        )}
        <li className="mb-4">
          <button
            onClick={handleLogout}
            className="block py-2 px-4 hover:bg-blue-700 rounded w-full text-left"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
