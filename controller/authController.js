import {User} from '../model/user.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { redisDbClient } from '../config/redisDb.js';
import { encrypt, decrypt } from "../config/cryption.js";
import {forgotPassword as forgotPasswordMail} from '../service/mail.js'
import { sanitize } from '../service/sanitize.js';

export async function register(req, res) {
    try {
  var { username, email, password } = req.body;
username=sanitize(username)
 const existingEmail = await User.findOne({ username });
    if (existingEmail) {
      return res.status(400).json({ error: "Existing Username" });
    }
    const existingUsername = await User.findOne({ email });
    if (existingUsername) {
      return res.status(400).json({ error: "Existing Email" });
    }

    password =  bcrypt.hashSync(password, await bcrypt.genSalt(10));
//Algorithm + Salt + Hash
    await User.create({
      username,
      email,
      password
    });

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
    try {
  const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password")
    if (!user) return res.status(404).json({ error: "Email Not Registered" });
//Get Salt, use it to Compare the Hashed Password with Input Password
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) return res.status(401).json({ error: "Invalid Password" });

    const signedToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", signedToken, {
      httpOnly: true, // Prevents Client-Side JavaScript Access
      secure: true,
      sameSite: 'None',
      maxAge: 1000 * 60 * 60, 
    });
     res.set('Authorization', `Bearer ${signedToken}`);

    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function logout(req, res) {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    res.status(200).json({ message: "Logout Successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function forgotPassword(req, res) {
  //Storing And Passing Encrypted Email In Query[Backend-Frontend-Backend]
  //Storing And Passing Encrypted Email In Cookie[Backend-Backend] 
  try {
    const { email } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email Not Registered" });

    const SECRET_KEY = Math.random().toString()
    const encryptedEmail = encrypt(email, SECRET_KEY);


 if(!(await redisDbClient.exists(encryptedEmail))){
    await redisDbClient.set(encryptedEmail, SECRET_KEY, { EX: 300 });
    await forgotPasswordMail(email,encryptedEmail); 
    res.status(200).json({ message: "Reset Password Link Sent" });
  }
  else{
res.status(409).json({ error: "Reset Password Link Already Sent" });
  }
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    var {encryptedEmail}=req.query
    const {password}=req.body
     encryptedEmail = decodeURIComponent(encryptedEmail);
    const SECRET_KEY = await redisDbClient.get(encryptedEmail);
    if (!SECRET_KEY) return res.status(400).json({ error: "Invalid or Expired Reset Password Link" });

    const email = decrypt(encryptedEmail, SECRET_KEY);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email Not Registered" });

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    await redisDbClient.del(encryptedEmail);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.status(200).json({ message: "Password Reset Successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}





export async function check(req, res) {
  try {
    const oldToken = req?.cookies?.token;

    if (!oldToken) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }


    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);


    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });


    res.cookie('token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 1000 * 60 * 60, 
    });
    res.set('Authorization', `Bearer ${newToken}`);

    return res.status(200).json({ message: 'Authenticated' });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}


export async function getProfile(req,res){
  try{
const {userId}=req
     const user = await User.findById(userId);
     return res.json(user)
  }
  catch(err){
    console.error('Error Getting Profile',err.message)
  }
}