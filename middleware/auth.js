import jwt from 'jsonwebtoken';
import { body, query, validationResult } from 'express-validator';

export function auth(req, res, next) {
 
      //Cookies for Websites[Stored in and passed as Cookie] and Header for Native Apps[Stored in Device Storage, passed as Authorization Header]
  const signedToken = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!signedToken) {
    throw new Error('No Token Found')
  }


    const token = jwt.verify(signedToken, process.env.JWT_SECRET);
    //Throws Error if not Verified.
    req.userId = token.id;  //Accessible from Route Function
    next();

}

export  async function validateRegister (req, res, next)  {
  const userSchema = [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
     .isEmail().withMessage('Invalid email format.'),

    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ];

 await Promise.all(userSchema.map(fieldSchema => fieldSchema.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
 throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
  }

  next();
};

export async function validateLogin  (req, res, next) {
  const userSchema = [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
       .isEmail().withMessage('Invalid email format.'),

    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ];
 await Promise.all(userSchema.map(fieldSchema => fieldSchema.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
 throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
  }

  next();
}

export async function validateForgotPassword  (req, res, next)  {
  const userSchema = [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
.isEmail().withMessage('Invalid email format.'),
  ];

 await Promise.all(userSchema.map(fieldSchema => fieldSchema.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
 throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
  }

  next();
};

export async function validateResetPassword   (req, res, next)  {
  const userSchema = [
    query('encryptedEmail')
      .notEmpty().withMessage('Reset token (encryptedEmail) is required.'),

    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ];

 await Promise.all(userSchema.map(fieldSchema => fieldSchema.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
 throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
  }

  next();
};