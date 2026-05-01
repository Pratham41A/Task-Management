import e from 'express';
import {  login, logout, register, resetPassword, refresh, getUsers, forgotPasswordOtp, verifyForgotPasswordOtp} from '../controller/authController.js';
import { auth, validateForgotPasswordOtp, validateGetUsers, validateLogin, validateRegister, validateResetPassword, validateVerifyForgotPasswordOtp } from '../middleware/auth.js'
import rateLimit from 'express-rate-limit';

 export const authRouter = e.Router();


 const verifyForgotPasswordOtpRateLimiter = rateLimit({
  windowMs: Number(eval(process.env.OTP_VERIFY_API_TRY_TIME)), 
  max: 5, 
  handler: (req, res) => {
   return res.status(429).json({ error: 'Too many OTP verification attempts from this IP, please try again after few minutes.' });
  },
  standardHeaders: true,//Response Headers
  legacyHeaders: true,//Response Headers
});

authRouter.post('/forgotPasswordOtp',validateForgotPasswordOtp, forgotPasswordOtp);
authRouter.post('/resetPassword', validateResetPassword,resetPassword);
authRouter.post('/verifyForgotPasswordOtp', verifyForgotPasswordOtpRateLimiter,validateVerifyForgotPasswordOtp,verifyForgotPasswordOtp);
authRouter.post('/login', validateLogin,login);
authRouter.post('/register',validateRegister, register);
authRouter.delete('/logout', auth,logout); 
authRouter.get('/users/:p?',auth,validateGetUsers,getUsers)
authRouter.post('/refresh', auth,refresh);