import mongoose from "mongoose";

const {Schema,model,models,Types}=mongoose
const taskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Title is Required"],
  },
  description: {
    type: String,
    trim:true
  },
expiryDateTime: {
  type: Date,
  required: [true, "Expiry is Required"],
  validate: [
    {
      validator: function (val) {
        return val.getTime() > Date.now();
      },
      message: 'Expiry Date Time must be in the future'
    }
  ]
}
,
  priority: {
    type: String,
     required: [true, "Priority is Required"],  
    enum: ['Low', 'Normal', 'High'],
    default: 'Normal',
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed','Expired'],
    default: 'Pending',
    required: [true, "Status is Required"],
  },
  createdBy: {  
    type: Types.ObjectId,
    ref: 'User',
    required: [true, "Created By is Required"]
  },  
  updatedBy: {
    type: Types.ObjectId,
    ref: 'User'
  },
  assignedTo: [{
    type: Types.ObjectId,
    ref: 'User',
    required: [true, "Assigned To is Required"]
  }]
}, {
timestamps: true, //  createdAt and updatedAt
   strict: true, // Include Schema Fields Only  
});
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1, expiryDateTime: 1 });

export const Task = models.Task || model("Task", taskSchema);