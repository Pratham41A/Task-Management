import mongoose from "mongoose";
import validator from 'validator';

const {isEmail}=validator
const {Schema,model,models}=mongoose
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is Required"],
      unique: [true, "Email Already Exists"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: [true, "Email Already Exists"],
      lowercase: true,
      validate: [isEmail, 'Invalid Email'],
      trim: true
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is Required"],
      minlength: [6, "Minimum 6 Characters Required"],
      select:false,//Not returned
      //Use .select('+password') to include it and include others
      //Use .select('password') to include it and exclude others
    },
  },
  {
    timestamps: false, //  createdAt and updatedAt
    //ISO8601 & UTC Format
    //ISO8601: YYYY-MM-DDTHH:MM:SS[Z/[+/-HH:MM]]
    //UTC: YYYY-MM-DDTHH:MM:SSZ
    //IST: YYYY-MM-DDTHH:MM:SS+05:30
   strict: true, // Include Schema Fields Only
  }
);



export const User = models.User || model("User", userSchema);
