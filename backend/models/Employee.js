// models/Employee.js
const mongoose = require('mongoose');

// Define schema for employee data
const employeeSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  employeeid: {
    type: String,
    required: true,
    unique: true
  },
  mobileno: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
    gender: { 
      type: String, 
      required: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    isAdmin: { type: Boolean, default: false },
   
}, { collection: "UserInfo",

}
);

// Create a model based on the schema
const UserInfo = mongoose.model('UserInfo', employeeSchema);

module.exports = UserInfo;
