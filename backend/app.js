const express = require('express');
const mongoose = require('mongoose');
const UserInfo = require('./models/Employee');
const EmployeeInfo = require('./models/User');
const LeaveApplication = require('./models/Leave');
const cors = require('cors');
const bcrypt = require('bcryptjs');
//const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files (uploaded images)
app.use(cors());

//app.use(morgan('dev'));
//const morgan = require('morgan');
//app.use(bodyParser.json());

// Define storage for the uploaded files using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
  },
});

const upload = multer({ storage: storage });

// Define route to handle file upload
app.post('/uploads', upload.single('profilePic'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Return the file path or URL of the uploaded file
  res.status(200).send({ fileUrl: `/uploads/${req.file.filename}` });
});
app.use('/uploads', express.static('uploads'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'plestarrajeshwari01@gmail.com',  // Your admin email address
    pass: 'Plestar@7542',  // Your email password or an app-specific password if you have 2FA enabled
  },
});


// Function to send email
const sendConfirmationEmail = async (userEmail, userFullName) => {
  const mailOptions = {
    from: 'plestarrajeshwari01@gmail.com',
    to: userEmail,
    subject: 'Thank You for Registering!',
    text: `Dear ${userFullName},\n\nThank you for registering with us! Your account has been successfully created.\n\nBest Regards,\nThe Admin Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};
app.use(cors({
    origin: 'https://react-project-sepia-tau.vercel.app',
    //origin: 'http://localhost:3000',// Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

const mongoUrl=process.env.MONGO_URL

mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
})
  .catch((e) => {
    console.log(e);
});


//require('./models/Employee');
//const User = mongoose.model("UserInfo")

app.get('/', (req, res) => {
    res.send('Welcome to the Employee API');
});

app.post('/register', async (req, res) => {
  const { fullname, employeeid, mobileno, password, confirmPassword, email, gender, address, dateOfJoining } = req.body;

  // Validation for required fields
  if (!fullname || !employeeid || !mobileno || !password || !confirmPassword || !email || !gender || !address || !dateOfJoining) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if the employee ID already exists
    const existingEmployee = await EmployeeInfo.findOne({ employeeid });
    if (!existingEmployee) {
      return res.status(400).json({ message: 'Invalid Employee ID ' });
    }

    // Check if the employee ID already exists in UserInfo (to avoid duplicate registrations)
    const existingUser = await UserInfo.findOne({ employeeid });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee ID is already registered' });
    }
    const existingEmail = await UserInfo.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Define admin condition (Here, we assume only a specific employeeId can be admin)
    const isAdmin = employeeid === "admin123";  // Example: Only employeeid "admin123" will be an admin

    // Create new user
    const newUser = new UserInfo({
      fullname,
      employeeid,
      mobileno,
      password: hashedPassword,
      confirmPassword: hashedPassword, // Store hashed password
      email,
      gender,
      address,
      dateOfJoining: new Date(dateOfJoining),
      isAdmin, // Set admin based on condition
    });

    await newUser.save();
    await sendConfirmationEmail(email, fullname);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during registration' });
  }
});


app.post('/login', async (req, res) => {
    const { employeeid, password } = req.body;

    if (!employeeid || !password) {
        return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    try {
        // Find user by employee ID
        const user = await UserInfo.findOne({ employeeid });
        console.log('Entered password:', password);
        console.log('Stored password:', user.password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid Employee ID' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid  password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin}, process.env.JWT_SECRET, { expiresIn: '10h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
 
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(process.env.JWT_SECRET);
    if (!token) {
      return res.status(401).json({ message: 'Access Denied, No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid token' });
    }
  };
  
  app.get('/profile', authenticateToken, async (req, res) => {
    try {
      // Assuming the token is decoded and user ID is available in `req.user.id`
      const userId = req.user.id;
  
      // Check if the userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
  
      // Fetch user profile along with additional role and department details
      const user = await UserInfo.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(userId) }, // Match the specific user by their ID
        },
        {
          $lookup: {
            from: 'EmployeeInfo', // Name of the EmployeeInfo collection (or any other collection with role details)
            localField: 'employeeid', // Field in UserInfo
            foreignField: 'employeeid', // Matching field in EmployeeInfo
            as: 'roleDetails', // Alias for the joined data
          },
        },
        {
          $unwind: {
            path: '$roleDetails', // Unwind the roleDetails array (if any)
            preserveNullAndEmptyArrays: true, // Allow users without role details
          },
        },
        {
          $project: {
            fullname: 1,
            employeeid: 1,
            mobileno: 1,
            email: 1,
            gender: 1,
            address: 1,
            dateOfJoining: 1,
            profilePic: 1,
            status: 1,
            role: '$roleDetails.role', // Extract the role
            department: '$roleDetails.department', // Extract the department
            assignedTeamLeader: '$roleDetails.assignedTeamLeader', // Extract the team leader if available
          },
        },
      ]);
  
      // Check if user was found
      if (!user || user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the user data with role and department details
      res.status(200).json(user[0]); // Return the first (and only) result
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  app.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from decoded token
        const { email, gender, address, profilePic } = req.body; // Extract fields to update

        // Validate the input
        if (!email || !gender || !address) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find the user and update their profile
        const updatedUser = await UserInfo.findByIdAndUpdate(
            userId,
            { email, gender, address, profilePic },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.', data: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
// Add this to your app.js or wherever you define routes
app.post("/apply-leave", authenticateToken, async (req, res) => {
  try {
    const { leaveType, permissionType, leaveDuration, halfDayOption, startDate, endDate, reason } = req.body;
    console.log(req.body);

    // Helper function to calculate totalDays
    const calculateTotalDays = (leaveType, leaveDuration, startDate, endDate) => {
      if (leaveType === "Leave") {
        if (leaveDuration === "Half Day") {
          return 0.5; // Half-day leave
        } else if (startDate && endDate) {
          return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        }
      } else if (leaveType === "Permission") {
        return 1; // Fixed value for permissions
      }
      return 0; // Default value if leaveType is invalid
    };

    // Calculate total days
    const totalDays = calculateTotalDays(leaveType, leaveDuration, startDate, endDate);


    const newLeave = new LeaveApplication({
      userId: req.user.id,
      leaveType,
      permissionType: leaveType === "Permission" ? permissionType : leaveDuration,
      halfDayOption: leaveDuration === "Half Day" ? halfDayOption : halfDayOption,
      startDate: leaveType === "Leave" ? startDate : startDate,
      endDate: leaveType === "Leave" ? endDate : null,
      reason,
      totalDays,
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave application submitted successfully", data: newLeave });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: "Error applying for leave", error: error.message });
  }
});


// GET route for viewing leave applications
app.get('/view-leaves', authenticateToken, async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { month, year } = req.query; // Get month and year from query parameters

    const query = { userId };

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      query.startDate = { $gte: startDate, $lt: endDate };
    }
    const leaveApplications = await LeaveApplication.find({ userId });

    res.status(200).json({data: leaveApplications});
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    res.status(500).json({ message: 'Error fetching leave applications' });
  }
});


// DELETE leave application
app.delete('/delete-leave/:id', authenticateToken, async (req, res) => {
  try {
      const leaveId = req.params.id;
      const userId = req.user.id; // Get the authenticated user's ID

      // Find and delete the leave application
      const leaveApplication = await LeaveApplication.findOneAndDelete({
          _id: leaveId,
          userId: userId, // Ensure only the user's leave application can be deleted
      });

      if (!leaveApplication) {
          return res.status(404).json({ message: 'Leave application not found.' });
      }

      res.status(200).json({ message: 'Leave application deleted successfully.' });
  } catch (error) {
      console.error('Error deleting leave application:', error);
      res.status(500).json({ message: 'Failed to delete leave application.' });
  }
});
 
// PUT (update) leave application
// Endpoint for editing leave application
// Backend Example (Express.js)
// PUT (update) leave application
app.put('/edit-leave/:id', authenticateToken, async (req, res) => {
  try {
    const leaveId = req.params.id; // ID from the URL
    const { leaveType, permissionType, leaveDuration, halfDayOption, startDate, endDate, reason } = req.body; // Destructure fields

    // Calculate totalDays
   // let totalDays = 0;
    //if (leaveType === "Leave" && startDate && endDate) {
   //   totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
   // } else if (leaveType === "Permission") {
    //  totalDays = 1; // Assuming fixed totalDays for permissions
   // }

    const calculateTotalDays = (leaveType, leaveDuration, startDate, endDate) => {
      if (leaveType === "Leave") {
        if (leaveDuration === "Half Day") {
          return 0.5; // Half-day leave
        } else if (startDate && endDate) {
          return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        }
      } else if (leaveType === "Permission") {
        return 1; // Fixed value for permissions
      }
      return 0; // Default value if leaveType is invalid
    };

    // Calculate total days
    const totalDays = calculateTotalDays(leaveType, leaveDuration, startDate, endDate);


    // Construct the updated leave data
    const updatedData = {
      leaveType,
      permissionType,
      leaveDuration,
      halfDayOption,
      startDate,
      endDate,
      reason,
      totalDays, // Include recalculated totalDays
    };

    // Update the leave application in the database
    const updatedLeave = await LeaveApplication.findByIdAndUpdate(
      leaveId,
      updatedData,
      { new: true } // Return the updated document
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    res.status(200).json({ message: 'Leave application updated successfully', data: updatedLeave });
  } catch (error) {
    console.error('Error updating leave application:', error);
    res.status(500).json({ message: 'Failed to update leave application' });
  }
});

// GET route for viewing a single leave application
app.get('/view-leave/:id', authenticateToken, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await LeaveApplication.findOne({ _id: leaveId, userId: req.user.id });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found.' });
    }

    res.status(200).json({ data: leave });
  } catch (error) {
    console.error('Error fetching leave application:', error);
    res.status(500).json({ message: 'Failed to fetch leave application.' });
  }
});

// GET route to fetch total leave and total permission for the logged-in user
app.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // From the authentication token
    const user = await UserInfo.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count total leave and permission applications for the user
    const leaveHistory = await LeaveApplication.find({ userId });
    const totalLeave = await LeaveApplication.countDocuments({ userId, leaveType: 'Leave' });
    const totalPermission = await LeaveApplication.countDocuments({ userId, leaveType: 'Permission' });

    // Count the Pending, Approved, and Rejected leaves
    const totalApproved = await LeaveApplication.countDocuments({userId, status: "Approved" });
    const totalRejected = await LeaveApplication.countDocuments({userId,status: "Rejected" });
    const totalPending = await LeaveApplication.countDocuments({userId, status: "Pending" });
    const totalCancelled = await LeaveApplication.countDocuments({userId, status: "Cancelled" });

    // Return the counts in the response
    res.status(200).json({
      leaveHistory,
      totalLeave,
      totalPermission,
      totalPending,
      totalApproved,
      totalRejected,
      totalCancelled,
      
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
});

app.get('/admin-profile', authenticateToken, async (req, res) => {
  try {
    // Assuming the token is decoded and user ID is available in `req.user.id`
    const user = await UserInfo.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // Return user profile data
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/admin-profile', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.id; // Extract user ID from decoded token
      const { email, gender, address, profilePic } = req.body; // Extract fields to update

      // Validate the input
      if (!email || !gender || !address) {
          return res.status(400).json({ message: 'All fields are required.' });
      }

      // Find the user and update their profile
      const updatedUser = await UserInfo.findByIdAndUpdate(
          userId,
          { email, gender, address, profilePic },
          { new: true } // Return the updated document
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'Profile updated successfully.', data: updatedUser });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error.' });
  }
});

const authenticateAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next(); // If the user is an admin, move to the next middleware or route handler
};

app.get('/admin-dashboard', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
      const userId = req.user.id;
      const user = await UserInfo.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Admin-specific logic
      res.status(200).json({
          message: 'Admin data fetched successfully',
          totalLeave: 10,  // Dummy data for admin stats
          totalPermission: 5,  // Dummy data
      });
  } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).json({ message: 'Failed to fetch admin data' });
  }
});

// Admin view all leave applications

app.get('/leave-history', async (req, res) => {
  try {
    // Step 1: Get all active employees
    const activeEmployees = await UserInfo.find({ status: 'active', }).select('_id'); // Fetch only active employees

    // Step 2: Get leave applications for active employees
    const leaveHistory = await LeaveApplication.find({
      userId: { $in: activeEmployees.map(employee => employee._id) } // Only fetch leave records of active employees
    })
    .populate('userId', 'fullname employeeid email gender address') // Populate employee details
    .sort({ appliedDate: -1 });

    // Step 3: Respond with filtered leave history
    res.status(200).json(leaveHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave history' });
  }
});


app.get('/employees', async (req, res) => {
  try {
    const employees = await UserInfo.aggregate([
      {
        $lookup: {
          from: 'EmployeeInfo', // Name of the EmployeeInfo collection
          localField: 'employeeid', // Field in UserInfo
          foreignField: 'employeeid', // Matching field in EmployeeInfo
          as: 'roleDetails', // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: '$roleDetails', // Unwind the roleDetails array
          preserveNullAndEmptyArrays: true, // Allow employees without a matching role
        },
      },
      {
        $project: {
          fullname: 1,
          employeeid: 1,
          mobileno: 1,
          email: 1,
          gender: 1,
          address: 1,
          dateOfJoining: 1,
          profilePic: 1,
          status: 1,
          role: '$roleDetails.role', 
          department: '$roleDetails.department',
          assignedTeamLeader: '$roleDetails.assignedTeamLeader'
        },
      },
    ]);

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employee data' });
  }
});


app.get('/employees/count', (req, res) => {
  Employee.countDocuments({}, (err, count) => {
    if (err) {
      return res.status(500).send('Error retrieving employee count');
    }
    res.json({ count });
  });
});

app.put('/leave-history/:id/approve', (req, res) => {
  const { id } = req.params;
  // Find the leave record by ID and update its status to "approved"
  Leave.findByIdAndUpdate(id, { status: 'approved' }, { new: true })
    .then(updatedLeave => res.json(updatedLeave))
    .catch(error => res.status(400).json({ error: 'Error approving leave' }));
});

app.get('/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  // logic to fetch employee data by employeeId
});


app.delete('/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await UserInfo.findByIdAndDelete(id);  // Using UserInfo
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// Update Employee Status to Inactive
app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status should be either "inactive" or "active"

  try {
    // Find the employee and update their status
    const updatedEmployee = await UserInfo.findByIdAndUpdate(
      id,
      { status }, // Update the status field
      { new: true } // Return the updated employee document
    );

    if (updatedEmployee) {
      res.status(200).json(updatedEmployee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee status' });
  }
});

app.put('/edit-employee/:id', async (req, res) => {
  const { fullname, mobileno, email, gender, address, password, confirmPassword } = req.body;

  // Validate that the required fields are provided
  if (!fullname || !mobileno || !email || !gender || !address) {
    return res.status(400).json({ message: 'All fields except password are required' });
  }

  // Ensure passwords match if provided
  if (password && password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Find the employee by ID
    const employee = await UserInfo.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee fields
    employee.fullname = fullname || employee.fullname;
    employee.mobileno = mobileno || employee.mobileno;
    employee.email = email || employee.email;
    employee.gender = gender || employee.gender;
    employee.address = address || employee.address;

    // Hash the new password if it is provided
    if (password) {
      employee.password = await bcrypt.hash(password, 10);
      employee.confirmPassword = employee.password;  // Ensure confirmPassword is also updated
    }

    // Save the updated employee
    const updatedEmployee = await employee.save();

    res.status(200).json({
      message: 'Employee updated successfully',
      user: updatedEmployee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

app.put('/approve-leave/:id', async (req, res) => {
  const leaveId = req.params.id;

  try {
    const leave = await LeaveApplication.findByIdAndUpdate(
      leaveId,
      { status: 'Approved' },
      { new: true }
    );

    if (leave) {
      res.status(200).json(leave);
    } else {
      res.status(404).json({ message: 'Leave application not found' });
    }
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject leave route
app.put('/reject-leave/:id', async (req, res) => {
  const leaveId = req.params.id;

  try {
    const leave = await LeaveApplication.findByIdAndUpdate(
      leaveId,
      { status: 'Rejected' },
      { new: true }
    );

    if (leave) {
      res.status(200).json(leave);
    } else {
      res.status(404).json({ message: 'Leave application not found' });
    }
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/cancel-leave/:leaveId', async (req, res) => {
  const { leaveId } = req.params;
  try {
      const leave = await LeaveApplication.findByIdAndUpdate(
          leaveId,
          { status: 'Cancelled' },
          { new: true }
      );
      if (!leave) {
          return res.status(404).json({ error: 'Leave not found' });
      }
      res.json({ message: 'Leave cancelled successfully', leave });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// In routes/leaveRoutes.js

app.get('/leave-history/:id', async (req, res) => {
  try {
    const activeEmployees = await UserInfo.find({ status: 'active' }).select('_id'); // Fetch only active employees
    const leaveHistory = await LeaveApplication.find({userId: { $in: activeEmployees.map(employee => employee._id) } }).populate("userId", "employeeid fullname");
    
    // Count the number of leaves with each status
    const totalApproved = await LeaveApplication.countDocuments({ status: "Approved" });
    const totalRejected = await LeaveApplication.countDocuments({ status: "Rejected" });
    const totalPending = await LeaveApplication.countDocuments({ status: "Pending" });

    res.status(200).json({
      leaveHistory,
      totalApproved,
      totalRejected,
      totalPending
    });
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST route for adding an employee with only employeeid and fullname
app.post('/add-basic', async (req, res) => {
  console.log(req.body);
  
    const { employeeid, fullname, role, department, assignedTeamLeader  } = req.body;

    // Validate if employeeid and fullname are provided
    if (!employeeid || !fullname || !role || !department ) {
      return res.status(400).json({ message: 'Employee ID and Full Name are required' });
    }

    // Check if employee already exists
    const existingEmployee = await EmployeeInfo.findOne({ employeeid });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
  try {
    // Create a new employee
    const newEmployee = new EmployeeInfo({
      employeeid,
      fullname,
      role,
      department,
      assignedTeamLeader: role === 'Employee' ? assignedTeamLeader : null,
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error creating employee. Please try again.' });
  }
});

app.get('/admin-edit-employee/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await UserInfo.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) }, // Match the specific employee by their ID
      },
      {
        $lookup: {
          from: 'EmployeeInfo', // Name of the EmployeeInfo collection
          localField: 'employeeid', // Field in UserInfo
          foreignField: 'employeeid', // Matching field in EmployeeInfo
          as: 'roleDetails', // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: '$roleDetails', // Unwind the roleDetails array
          preserveNullAndEmptyArrays: true, // Allow employees without a matching role
        },
      },
      {
        $project: {
          fullname: 1,
          employeeid: 1,
          mobileno: 1,
          email: 1,
          gender: 1,
          address: 1,
          dateOfJoining: 1,
          profilePic: 1,
          status: 1,
          role: '$roleDetails.role',
          department: '$roleDetails.department',
          assignedTeamLeader: '$roleDetails.assignedTeamLeader',
        },
      },
    ]);

    if (!employee || employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employee[0]); // Return the first (and only) result
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.put('/admin-edit-employee/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; // Get employee ID from the URL
  const { fullname, email, gender, address, mobileno, dateOfJoining, role, department, assignedTeamLeader,} = req.body; // Extract fields to update

  try {
    // Validate input
    if (!fullname || !email || !gender || !address || !mobileno || !dateOfJoining) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Find employee and update their details
    const updatedEmployee = await UserInfo.findByIdAndUpdate(
      id,
      { fullname, email, gender, address, mobileno, dateOfJoining },
      { new: true } // Return the updated document
    );

    const updatedRole = await EmployeeInfo.findOneAndUpdate(
      { employeeid: updatedEmployee.employeeid },
      { role, department, assignedTeamLeader },
      
      { new: true }
    );

    if (!updatedEmployee || !updatedRole) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee updated successfully.', data: updatedEmployee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/team-leaders', async (req, res) => {
  try {
    const teamLeaders = await EmployeeInfo.find({ role: 'TeamLeader' }, 'fullname employeeid');
    res.json(teamLeaders);
  } catch (error) {
    console.error('Error fetching team leaders:', error);
    res.status(500).json({ message: 'Error fetching team leaders' });
  }
});

app.get('/leaves-history', async (req, res) => {
  try {
    // Step 1: Get all active users
    const activeUsers = await UserInfo.find({ status: "active" }); // Fetch only active users

    // Step 2: Filter employees from EmployeeInfo with role as "Employee"
    const employeeIds = await EmployeeInfo.find({ role: "Employee" }).select("_id");

    // Step 3: Fetch Leave Applications for active employees
    const leaveApplications = await LeaveApplication.find({
      userId: { $in: activeUsers.map((user) => user._id) }, // Match active user IDs
      employeeId: { $in: employeeIds.map((employee) => employee._id) }, // Match employees with role
    })
      .populate("userId", "fullname employeeid email gender") // Populate user details
      .populate("employeeId", "department role") // Populate employee details
      .sort({ appliedDate: -1 }); // Sort by applied date (latest first)

    // Step 4: Send the leave history as a response
    res.status(200).json(leaveApplications);
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.status(500).json({ message: "Failed to fetch leave history", error });
  }
});


app.listen(5001, () => {
    console.log('Server running on port 5000');
});
