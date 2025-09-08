import jwt from 'jsonwebtoken';
import { body,param,  validationResult } from 'express-validator';
export function auth(req, res, next) {

      //Cookies for Websites[Stored in and passed as Cookie] and Header for Native Apps[Stored in Device Storage, passed as Authorization Header]
  const signedToken = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!signedToken) {
   return res.status(401).json({error:'Not Logged In'});
  }

try{
    const token = jwt.verify(signedToken, process.env.JWT_SECRET);
  
    req.userId = token.id;  //Accessible from Route Handler
    next();
}
catch(error){
return    res.status(401).json({error:error.message});
}
}


export async function validateGetUsers(req,res,next){

    try {
     await param('p')
     .trim()
      .isIn(['me'])
      .run(req);
        const validationErrors = validationResult(req).array();
  const errors = [];
  if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }
  if(errors.length>0){
    return res.status(400).json({ error: errors.join('\n') });
  }
      next();
    }
catch(error){
return    res.status(500).json({ error: error.message });
}
}














export async function validateRegister(req, res, next) {

try{
  await Promise.all([
    body('username')
      .trim()
      .notEmpty().withMessage('Username is Required.')
      .run(req),

    body('email')
      .trim()
      .notEmpty().withMessage('Email is Required.')
      .isEmail().withMessage('Invalid Email.')
      .run(req),

    body('password')
      .trim()
      .notEmpty().withMessage('Password is Required.')
      .isLength({ min: 6 }).withMessage('Minimum 6 Characters Required')
      .run(req),
  ]);

  const validationErrors = validationResult(req).array();
  const errors = [];

  if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }


  if (errors.length > 0) {
 return    res.status(400).json({ error: errors.join('\n') });
  }

  next();
}
catch(error){
 return res.status(500).json({error:error.message});
}
}


export async function validateLogin(req, res, next) {

  try {
    await Promise.all([
      body('email')
        .trim()
        .notEmpty().withMessage('Email is Required.')
        .isEmail().withMessage('Invalid Email')
        .run(req),

      body('password')
        .trim()
        .notEmpty().withMessage('Password is Required.')
        .isLength({ min: 6 }).withMessage('Minimum 6 Characters Required')
        .run(req),
    ]);
  
    const validationErrors = validationResult(req).array();
    const errors = [];
      if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('\n') });
    }

    next();
  } catch (error) {
  return   res.status(500).json({ error:error.message });
  }
}



export async function validateForgotPasswordOtp(req, res, next) {


  try {
    await Promise.all([
      body('email')
        .trim()
        .notEmpty().withMessage('Email is Required.')
        .isEmail().withMessage('Invalid Email')
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();
    const errors = [];

  if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }


    if (errors.length > 0) {
     return  res.status(400).json({error:errors.join('\n')});
    }

    next();
  } catch (error) {

    return res.status(500).json({ error: error.message });
  }
}

export async function validateVerifyForgotPasswordOtp(req, res, next) {

   try {
    await Promise.all([
      body('email')
        .trim()
        .notEmpty().withMessage('Email is Required.')
        .isEmail().withMessage('Invalid Email')
        .run(req),

      body('otpInput')
        .notEmpty().withMessage('Otp is Required.')
        .isLength({ min: 5,max:5 }).withMessage('6 Characters Otp Required')
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();
    const errors = [];

  if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }


    if (errors.length > 0) {
     return  res.status(400).json({error:errors.join('\n')});
    }

    next();
  } catch (error) {

    return res.status(500).json({ error: error.message });
  }
}
export async function validateResetPassword(req, res, next) {

  try {
    await Promise.all([
      body('email')
        .trim()
        .notEmpty().withMessage('Email is Required.')
        .isEmail().withMessage('Invalid Email')
        .run(req),

      body('password')
        .notEmpty().withMessage('Password is Required.')
        .isLength({ min: 6 }).withMessage('Minimum 6 Characters Required')
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();
    const errors = [];

  if (validationErrors.length>0) {
    errors.push(...validationErrors.map(error => error.msg));
  }

    if (errors.length > 0) {
     return  res.status(400).json({error:errors.join('\n')});
    }

    next();
  } catch (error) {

    return res.status(500).json({ error: error.message });
  }
}
