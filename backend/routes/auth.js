const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
    const { fullName, employeeId, mobileNumber, password } = req.body;

    try {
        const userExists = await User.findOne({ employeeId });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ fullName, employeeId, mobileNumber, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update password
router.post('/password', async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        const user = await User.findOne({ employeeId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = password; // Will be hashed automatically
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
