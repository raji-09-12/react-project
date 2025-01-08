import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Password from './Password';
import Profile from './Profile'; 
import Dashboard from './Dashboard';
import ApplyLeave from './ApplyLeave';
import ViewLeaveApplications from './ViewLeaveApplications';
import EditLeaveApplication from './EditLeaveApplication';
import AdminDashboard from './AdminDashboard';
import AdminProfile from './AdminProfile'; 
import AdminViewLeave from './AdminViewLeave';
import AdminEmployeeList from './AdminEmployeeList';
import AdminEditEmployee from './AdminEditEmployee';
import AddEmployee from './AdminAddEmployee';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password" element={<Password />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/apply-leave" element={<ApplyLeave />} />
      <Route path="/view-leaves" element={<ViewLeaveApplications />} />
      <Route path="/edit-leave/:leaveId" element={<EditLeaveApplication />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-profile" element={<AdminProfile />} />
      <Route path="/leave-history" element={<AdminViewLeave />} />
      <Route path="/employees" element={<AdminEmployeeList />} />
      <Route path="/edit-employee/:id" element={<AdminEditEmployee />} />
       <Route path="/admin-addemployee" element={<AddEmployee />} />

      
    </Routes>
  );
}

export default App;
