import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;
const { ObjectId } = Types;

const taskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Title is Required"],
  },
  description: {
    type: String,
    trim: true
  },
  expiryDateTime: {
    type: Date,
    required: [true, "Expiry is Required"],
    validate: [
      {
        validator: function (expiryDateTime) {
          return expiryDateTime.getTime() > Date.now();
        },
        message: "Expiry Date Time must be in Future"
      }
    ]
  },
  priority: {
    type: String,
    required: [true, "Priority is Required"],
    enum: ["Low", "Normal", "High"],
    default: "Normal",
  },
  status: {
    type: String,
    required: [true, "Status is Required"],
    enum: ["Pending", "Started", "Completed", "Expired"],
    default: "Pending",
  },
  createdBy: {
    type: ObjectId,
    ref: "User",
    required: [true, "Created By is Required"]
  },
  updatedBy: {
    type: ObjectId,
    ref: "User"
  },
  assignedTo: {
    type: [{
      type: ObjectId,
      ref: "User"
    }],
    required: [true, "Assigned To is Required"],
    validate: {
      validator: function (assignedTo) {
        const { length: assignedToLength } = assignedTo;
        return assignedToLength > 0;
      },
      message: "Minimum One User must be Assigned To"
    }
  }
}, {
  timestamps: true, //  createdAt and updatedAt
  strict: true, // Include Schema Fields Only
});

taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });

const {Task: TaskModel} = models;

export const Task = TaskModel || model("Task", taskSchema, "Task");