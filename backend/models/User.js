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
  roal: {
    type: String,
    required: true,
  },
}, { collection: "EmployeeInfo" });  // Store in 'employees' collection

const EmployeeInfo = mongoose.model('EmployeeInfo', userSchema);

module.exports = EmployeeInfo;
