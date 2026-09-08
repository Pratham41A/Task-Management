import express from 'express';
import {  login, logout, register, refresh, getUsers} from '../controller/authController.js';
import { auth, validateGetUsers, validateLogin, validateRegister } from '../middleware/auth.js'

const { Router } = express || {};

export const authRouter = Router();

authRouter.post('/login', validateLogin,login);
authRouter.post('/register',validateRegister, register);
authRouter.delete('/logout', auth,logout); 
authRouter.get('/users/:p?',auth,validateGetUsers,getUsers)
authRouter.post('/refresh', auth,refresh);