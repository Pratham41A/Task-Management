import mongoose from "mongoose";
import validator from 'validator';

const { isEmail } = validator;
const { Schema, model, models } = mongoose;


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email address'],
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select:false,//Not returned in queries
      //Use .select('+password') to include it along with other fields
      //Use .select('email') to include only email and exclude others
    },
  },
  {
    timestamps: true, //  createdAt and updatedAt
   strict: true, // Allow storing fields in Document ,which are defined in Schema ,others will be ignored
    toJSON: {//JSON representation of the document
      transform(document, object, options) {
        delete object.password;
        delete object.__v;
        delete object.createdAt;
        delete object.updatedAt;
        return object;
      },
    },
  }
);

//Indexing For Faster Queries Because of Searching On B / B+ Tree.

export const User = models.User || model("User", userSchema);
