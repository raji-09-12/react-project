const express = require('express');
const Employee = require('../models/Employee');
const router = express.Router();

// Route to handle Employee signup (Create employee)
router.post('/signup', async (req, res) => {
  try {
    const { fullname, employeeid, mobileno, password } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ employeeid });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    // Create new employee
    const employee = new Employee({ fullname, employeeid, mobileno, password });
    await employee.save();

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
