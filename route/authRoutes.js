import e from 'express';
import { forgotPassword, login, logout, register, resetPassword } from '../controller/authController.js';
import { validateForgotPassword, validateLogin, validateRegister, validateResetPassword } from '../middleware/auth.js'
 const authRouter = e.Router();


 
authRouter.post('/register',validateRegister, register);
authRouter.post('/login', validateLogin,login);
authRouter.delete('/logout', logout); 
authRouter.post('/forgotPassword',validateForgotPassword, forgotPassword);
authRouter.post('/resetPassword', validateResetPassword,resetPassword);
export default authRouter