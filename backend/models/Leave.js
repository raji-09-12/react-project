const mongoose = require("mongoose");

const LeaveApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserInfo",
    required: true,
  },
  employeeid: { type: String, required: true },
  leaveType: { type: String, required: true },
  leaveDuration: { type: String },
  permissionType: { type: String },
  halfDayOption: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  reason: { type: String, required: true },
  totalDays: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancel"], default: "Pending" },
  statusReason: { type: String, default: null },
  appliedDate: { type: Date, default: new Date() }, 
  fullname: { type: String },
  department: { type: String },
  assignedTeamLeader: { type: String },
});

module.exports = mongoose.model("LeaveApplication", LeaveApplicationSchema);
