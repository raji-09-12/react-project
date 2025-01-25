// models/Employee.js
const mongoose = require('mongoose');

// Define schema for employee data (just employeeid and fullname)
const userSchema = new mongoose.Schema({
  employeeid: {
    type: String,
    required: true,
    unique: true, // Ensures the employeeid is unique
  },
  fullname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  assignedTeamLeader: {
    type: String, 
    required: function () {
      return this.role === 'Employee';
    },
  },
}, { collection: "EmployeeInfo" });  

const EmployeeInfo = mongoose.model('EmployeeInfo', userSchema);

module.exports = EmployeeInfo;
