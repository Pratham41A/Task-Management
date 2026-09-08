import mongoose from "mongoose";
import validator from "validator";

const { isEmail } = validator;

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is Required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is Required"],
      minlength: [5, "Minimum 5 Password Characters Required"],
      select: false, //Not returned
      //Use .select('+password') to include it and include others
      //Use .select('password') to include it and exclude others
    },
  },
  {
    timestamps: true, //  createdAt and updatedAt
    // ISO 8601 (UTC or Local)
    // Schema:  YYYY-MM-DDThh:mm:ss[Z|[+/-]hh:mm]
    // Example: 2026-09-05T11:54:30+05:30

    // UTC (Coordinated Universal Time)
    // Schema:  YYYY-MM-DDThh:mm:ssZ
    // Example: 2026-09-05T06:24:30Z

    // IST (Indian Standard Time)
    // Schema:  YYYY-MM-DDThh:mm:ss+05:30
    // Example: 2026-09-05T11:54:30+05:30

    strict: true, // Allow Schema Fields Only
  }
);

const { User: UserModel } = models;

export const User = UserModel || model("User", userSchema, "User");
