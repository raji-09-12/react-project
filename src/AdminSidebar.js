import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
     {!isOpen && (  
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded"
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>
     )}
      <div className="flex">
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-6 w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white bg-gray-700 p-2 rounded md:hidden"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul>
          <li className="mb-4">
            <Link to="/admin-dashboard" className="block py-2 px-4 hover:bg-blue-700 rounded">
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/admin-profile" className="block py-2 px-4 hover:bg-blue-700 rounded">
              Profile
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/employees" className="block py-2 px-4 hover:bg-blue-700 rounded">
              Manage Employee
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/leave-history" className="block py-2 px-4 hover:bg-blue-700 rounded">
              Leave History
            </Link>
          </li>
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
    </div>
    </>
  );
};

export default Sidebar;
