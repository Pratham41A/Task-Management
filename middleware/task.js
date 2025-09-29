import { body, param, validationResult } from 'express-validator';
import validator from 'validator';


const {isMongoId}=validator
export async function validateCreate(req, res, next) {


  try {
    await Promise.all([
      body('title')
      .trim()
        .isString().withMessage('Title must be a string.')
        .notEmpty().withMessage('Title is required.')
        .run(req),

      body('description')
        .trim()
        .optional()
        .isString().withMessage('Description must be a string.')
        .run(req),

      body('expiryDateTime')
        .isISO8601().withMessage('Expiry Date Time must be a valid Date.')
        .notEmpty().withMessage('Expiry Date Time is required.')
        .custom(value => {
          if ((new Date(value)).getTime() <= Date.now()) {
            throw new Error('Expiry Date Time must be in Future.');
          }
          return true;
        })
        .run(req),

      body('priority')
        .trim()
        .optional()
        .isIn(['Low', 'Normal', 'High']).withMessage('Priority must be one of Low, Normal, or High.')
        .run(req),

      body('status')
        .trim()
        .optional()
        .isIn(['Pending', 'Completed']).withMessage('Status must be either Pending or Completed.')
        .run(req),

      body('assignedTo')
        .trim()
        .optional()
        .isArray().withMessage('AssignedTo must be an array of ObjectIds.')
        .custom((value) => {
          for (let id of value) {
            if (!isMongoId(id)) {
              throw new Error('Each assignedTo item must be a valid MongoDB ObjectId.');
            }
          }
          return true;
        })
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();
    const errors = validationErrors.map(error => error.msg);
    if (errors.length > 0) {
     return res.status(400).json({ error: errors.join('\n') });
    }



    next();
  } catch (error) {
  return    res.status(500).json({ error: error.message });
  }
}

export async function validateUpdate(req, res, next) {

  try {
    await Promise.all([
      body('id')
        .notEmpty().withMessage('ID is required.')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId.')
        .run(req),

      body('title')
      .trim()
        .isString().withMessage('Title must be a string.')
        .run(req),

      body('description')
        .trim()
        .isString().withMessage('Description must be a string.')
        .run(req),

      body('expiryDateTime')
        .isISO8601().withMessage('Expiry Date Time must be a valid Date.')
        .custom(value => {
          if ((new Date(value)).getTime() <= Date.now()) {
            throw new Error('Expiry Date Time must be in Future.');
          }
          return true;
        })
        .run(req),

      body('priority')
      .trim()
        .isIn(['Low', 'Normal', 'High']).withMessage('Priority must be one of Low, Normal, or High.')
        .run(req),

      body('status')
        .trim()
        .isIn(['Pending', 'Completed']).withMessage('Status must be either Pending or Completed.')
        .run(req),

      body('assignedTo')
        .trim()
        .isArray().withMessage('AssignedTo must be an array of ObjectIds.')
        .custom((value) => {
          for (let id of value) {
            if (!isMongoId(id)) {
              throw new Error('Each assignedTo item must be a valid MongoDB ObjectId.');
            }
          }
          return true;
        })
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();
    const errors = validationErrors.map(error => error.msg);


    if (errors.length > 0) {
     return  res.status(400).json({ error: errors.join('\n') });
    }



    next();
  } catch (error) {
   return  res.status(500).json({ error: error.message });
  }
}




export async function validateDelete(req, res, next) {


  try {
    await param('id')
      .notEmpty().withMessage('ID is required.')
      .isMongoId().withMessage('ID must be a valid MongoDB ObjectId.')
      .run(req);

    const validationErrors = validationResult(req).array();
    const errors = validationErrors.map(error => error.msg);



    if (errors.length > 0) {
    return   res.status(400).json({ error: errors.join('\n') });
    }

    next();
  } catch (error) {
     return res.status(500).json({ error: error.message });
  }
}

export async function validateGetTaskById(req, res, next) {

  try {
    await param('id')
      .notEmpty().withMessage('ID is required.')
      .isMongoId().withMessage('ID must be a valid MongoDB ObjectId.')
      .run(req);

    const validationErrors = validationResult(req).array();
    const errors = validationErrors.map(error => error.msg);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('\n') });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}