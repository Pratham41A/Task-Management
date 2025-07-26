import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  expiryDateTime: {
    type: Date,
    required: [true, "Expiry date is required"],
   validate: [
  function (value) {
    return value > new Date();
  },
  'Expiry date must be after the created date.'
],
  },
  priority: {
    type: String,
     required: [true, "Priority is required"],  
    lowercase: true,
    enum: ['Low', 'Normal', 'High'],
    default: 'Normal',
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, "Created by is required"]
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, "Created by is required"]
  },
  assignedTo: [{
    type: Types.ObjectId,
    ref: 'User',
    required: [true, "Assigned to is required"]
  }]
}, {
timestamps: true, //  createdAt and updatedAt
   strict: true, // Allow storing fields in Document ,which are defined in Schema ,others will be ignored
});

//Indexing For Faster Queries Because of Searching On B / B+ Tree.

export const Task = models.Task || model("Task", taskSchema);

  