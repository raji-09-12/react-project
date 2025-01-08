const express = require('express');
const connectDB = require('./db')
const Employee = require('./models/Employee');
const employeeRoutes = require('./routes/employee');


const app = express();
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Welcome to the Employee API');
});

// Employee routes
app.use('/api/employees', employeeRoutes);

connectDB()


app.listen(5000, () => {
    console.log('Server running on port 5000');
});
