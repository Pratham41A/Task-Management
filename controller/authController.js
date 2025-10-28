import {User} from '../model/user.js'
import jwt from "jsonwebtoken";
import { Otp } from '../model/otp.js';
import {forgotPasswordOtpMailTemplate} from '../service/mailTemplates.js'
import { sanitize } from '../service/sanitize.js';
import bcrypt from 'bcryptjs';
export async function getUsers(req, res, next) {
    const { p } = req.params;
    const {userId}=req
    var field
    var value
     if (p === 'me') {
        field="_id";
        value=userId;
      }
      else if (p===undefined){
        field=null
        value=null
      }
      else{
        return res.status(400).json({ error: 'Invalid Parameter' });
      }
       const q = (field &&value )? { [field]: value } : {}; 

      try {
        const user = await User.findOne({ _id: userId });
        if (user.username === 'ADMIN') {
           const users = await User.find(q).lean();
           return res.status(200).json({message:users});
        }
        if ( field==='_id') {
    const users = await User.findById(q).lean();
     return res.status(200).json({message:users});
        }
  
  } catch (error) {
   return res.status(500).json({ error: error.message });
  }
}

export async function register(req, res) {
    var { username, email, password } = req.body;
    email=sanitize(email)
password= bcrypt.hashSync(sanitize(password), await bcrypt.genSalt(10));
username=sanitize(username)
const q={email,username,password}
    try {
const existingUser = await User.findOne({
  $or: [
    { email },
    { username }
  ]
});

  if (existingUser) {
    return res.status(400).json({error:'Email or Username Already Exists'});
  }

    await User.create(q);

  return  res.status(201).json({ message: "Register" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
      var { email, password } = req.body;
      email=sanitize(email)
      password=sanitize(password)
  
     
    try {
          const existingEmail = await User.findOne({ email }).select("password")
        if (!existingEmail) {return res.status(400).json({ error:"Email Not Exists"} );}

        const isPassword = await bcrypt.compare(password, existingEmail.password);
        if (!isPassword) {return res.status(400).json( { error:"Invalid Password"});}
  const id=existingEmail._id
    const signedToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie("token", signedToken, {
      httpOnly: true, // Prevents Client-Side JavaScript Access
      secure: Boolean(process.env.COOKIE_SECURE),
      sameSite: process.env.COOKIE_SAME_SITE,
      maxAge: Number(eval(process.env.COOKIE_JWT_EXPIRY)), 
    });
     res.set('Authorization', `Bearer ${signedToken}`);

   return res.status(200).json({ message: "Login" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
export async function forgotPasswordOtp(req, res) {
    var { email } = req.body;
email=sanitize(email)

const otp=Math.random().toString().slice(-5)//Last 5 Digits of string
  try {
          const existingEmail = await User.findOne({ email });
if(!existingEmail){
  return res.status(400).json({error:'Email Not Exists'})
}
const otpSent=await Otp.findOne({email})
if(otpSent){
  return res.status(400).json({error:'Otp Already Sent'})
}

   /*
    await forgotPasswordOtpMailTemplate(email,otp)
    */
    await Otp.create({email,otp})
  return  res.status(200).json({ message: otp });
  } catch (error) {
  return  res.status(500).json({ error: error.message });
  }
}

export async function verifyForgotPasswordOtp(req, res) {
  var {email,otpInput}=req.body
email=sanitize(email)
otpInput=sanitize(otpInput)
    try{
          const existingEmail = await User.findOne({ email });
if(!existingEmail){
  return res.status(400).json({error:'Email Not Exists'})
}
  const otpSent=await Otp.findOne({email})

  if(!otpSent){
    return res.status(400).json({error:'Otp Not Exists'})
  }
      if(otpSent.otp===otpInput){
        otpSent.verified=true
        await otpSent.save()
      return  res.status(200).json({ message: "Verify Forgot Password Otp" });
      }
      else{
      return  res.status(400).json({ error: "Invalid Otp Input" });
      }
    }
    catch(error){
       return res.status(500).json({ error: error.message });
    }
}
export async function resetPassword(req, res) {
  var {email,password}=req.body
  email=sanitize(email)
  password=bcrypt.hashSync(sanitize(password), await bcrypt.genSalt(10));
  try {
   const existingEmail = await User.findOne({ email });
if(!existingEmail){
  return res.status(400).json({error:'Email Not Exists'})
}
const otp= await Otp.findOne({ email, verified: true });

if (!otp) {
  return res.status(400).json({ error: 'Otp Not Exists or Not Verified' });
}

     await User.findOneAndUpdate({ email }
      ,
      {
        $set: {
          password
        },
      }
    );
await Otp.findOneAndDelete({email})

    res.clearCookie("token", {
      httpOnly: true,
      secure: Boolean(process.env.COOKIE_SECURE),
      sameSite: process.env.COOKIE_SAME_SITE,
    });

 return   res.status(200).json({ message: "Reset Password" });
  } catch (error) {
 return   res.status(500).json({ error: error.message });
  }
}

export async function refresh(req,res){ 
  const {userId}=req
  try{

const signedToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie("token", signedToken, {
      httpOnly: true, // Prevents Client-Side JavaScript Access
      secure: Boolean(process.env.COOKIE_SECURE),
      sameSite: process.env.COOKIE_SAME_SITE,
      maxAge: Number(eval(process.env.COOKIE_JWT_EXPIRY)), 
    });
     res.set('Authorization', `Bearer ${signedToken}`);

  return  res.status(200).json({ message: "Refresh" });

  }
  catch(error){
      return  res.status(401).json({ error: error.message });
  }
}





export async function logout(req, res) {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: Boolean(process.env.COOKIE_SECURE),
      sameSite: process.env.COOKIE_SAME_SITE,
    });
  return  res.status(200).json({ message: "Logout" });
  } catch (error) {
  return  res.status(500).json({ error: error.message });
  }
}
