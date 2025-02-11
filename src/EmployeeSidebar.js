import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ handleLogout, role }) => {
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle state

  return (
    <>
      {/* Toggle Button (Mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded"
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-6 w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Sidebar Header with Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {role === "TeamLeader"
              ? "Team Leader Panel"
              : role === "Department Leader"
              ? "Department Leader Panel"
              : "Employee Panel"}
          </h2>
          {/* Close Button (only on Mobile) */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white bg-gray-700 p-2 rounded">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Sidebar Links */}
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
            <Link to="/view-leave" className="block py-2 px-4 hover:bg-blue-700 rounded">
              Leave History
            </Link>
          </li>
          {/* Conditional rendering for Team Leaders & Department Leaders */}
          {(role === "TeamLeader" || role === "Department Leader") && (
            <li className="mb-4">
              <Link to="/leader-view-leave-history" className="block py-2 px-4 hover:bg-blue-700 rounded">
                Employees Leave History
              </Link>
            </li>
          )}
          <li className="mb-4">
            <button onClick={handleLogout} className="block py-2 px-4 hover:bg-blue-700 rounded w-full text-left">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
