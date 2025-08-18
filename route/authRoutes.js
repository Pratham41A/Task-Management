import e from 'express';
import { forgotPassword, login, logout, register, resetPassword,check ,getProfile} from '../controller/authController.js';
import { auth, validateForgotPassword, validateLogin, validateRegister, validateResetPassword } from '../middleware/auth.js'
 const authRouter = e.Router();


 
authRouter.post('/register',validateRegister, register);
authRouter.post('/login', validateLogin,login);
authRouter.delete('/logout', logout); 
authRouter.post('/forgotPassword',validateForgotPassword, forgotPassword);
authRouter.post('/resetPassword', validateResetPassword,resetPassword);
authRouter.post('/check', check); 
authRouter.get('/profile',auth,getProfile)
export default authRouter