import { body, validationResult } from 'express-validator';
import validator from 'validator';
const { isMongoId } = validator;

export  async function validateCreate(req,res, next) {


  const taskSchema = [
    body('title')
      .isString()
      .notEmpty()
      .withMessage('Title is required.'),
      
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string.'),

    body('expiryDateTime')
      .isISO8601()
      .withMessage('Expiry date must be a valid ISO 8601 date.')
      .notEmpty()
      .withMessage('Expiry date is required.')
      .custom((value) => {
    const inputDate = new Date(value);
    const now = new Date();
    if (inputDate <= now) {
      throw new Error('Expiry date must be in the future.');
    }
    return true;
  }),

    body('priority')
      .isIn(['Low', 'Normal', 'High'])
      .withMessage('Priority must be one of Low, Normal, or High.'),

    body('status')
      .isIn(['Pending', 'Completed'])
      .withMessage('Status must be either Pending or Completed.'),

      body('assignedTo')
      .isArray()
      .withMessage('AssignedTo must be an array of ObjectIds.')
      .notEmpty()
      .withMessage('AssignedTo is required.')
      .custom((value) => {
        
        for (let id of value) {
          if (!isMongoId(id)) {
            throw new Error(`Each assignedTo item must be a valid MongoDB ObjectId.`);
          }
        }
        return true;
      })
  ];


  await Promise.all(taskSchema.map(fieldSchema => fieldSchema.run(req)))

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
      throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
      }
      next();
    
}


export async function validateUpdate(req,res,next)  {
 
 const taskSchema = [
  body('id')
      .isMongoId()
      .withMessage('ID must be a valid MongoDB ObjectId.')
      .notEmpty()
      .withMessage('ID is required.'),
    body('title')
      .isString()
      .withMessage('Title must be String.')
      .optional(),
      
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string.'),

    body('expiryDateTime')
      .isISO8601()
      .withMessage('Expiry date must be a valid ISO 8601 date.')
      .optional()
      .custom((value) => {
    const inputDate = new Date(value);
    const now = new Date();
    if (inputDate <= now) {
      throw new Error('Expiry date must be in the future.');
    }
    return true;
  }),
    body('priority')
      .isIn(['Low', 'Normal', 'High'])
      .withMessage('Priority must be one of Low, Normal, or High.')
      .optional()
     ,

    body('status')
      .isIn(['Pending', 'Completed'])
      .withMessage('Status must be either Pending or Completed.')
      .optional()
      ,
      body('assignedTo')
      .isArray()
      .withMessage('AssignedTo must be an array of ObjectIds.')
      .optional()
      .custom((assignedTo) => {
        
        for (let id of assignedTo) {
          if (!isMongoId(id)) {
                        throw new Error(`Each assignedTo item must be a valid MongoDB ObjectId.`);
          }
        }
        return true;
      })
  ];


  await Promise.all(taskSchema.map(fieldSchema => fieldSchema.run(req)))
 
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
      }
      
      next();
  
   
}

export async function validateDelete(req,res,next){
  const taskSchema = [
  body('id')
      .isMongoId()
      .withMessage('ID must be a valid MongoDB ObjectId.')
      .notEmpty()
      .withMessage('ID is required.')]
 
      await Promise.all(taskSchema.map(fieldSchema => fieldSchema.run(req)))
 
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(`Task Validation Failed: ${errors.array().map(err => err.msg).join('\n ')}`)
      }
      
      next();
      
}
