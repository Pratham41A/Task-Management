import mongoose from "mongoose";
import validator from 'validator';
const {Schema,model,models}=mongoose
const {isEmail}=validator
const otpSchema = new Schema(
  {
    email: {
      type:String,
      required: [true, "Email is Required"],
      unique: [true, "Email Already Exists"],
      lowercase: true,
      validate: [isEmail, 'Invalid Email'],
      trim: true
    },
  otp: {
    type: String,
    trim: true,
    minLength:[5,"5 Characters Required"],
    maxLength:[5,"5 Characters Required"],
    required: [true, "Otp is Required"],
  },
 expiry: {
    type: Date,
    default: Date.now,
    expires: 300
  },
  verified: {
    type: Boolean,
    default: false
  },
  
  },
  {
    timestamps: false, 
   strict: true, // Include Schema Fields Only
  }
);

otpSchema.index({ email: 1, verified: 1 });
export const Otp = models.Otp || model("Otp", otpSchema);
