import {
  body,
  param,
  validationResult,
} from 'express-validator';

export async function validateCreateTask(req, res, next) {
  try {
    await Promise.all([
      body('title')
        .trim()
        .notEmpty()
        .withMessage('Missing Title')
        .run(req),

      body('description')
        .trim()
        .optional()
        .run(req),

      body('expiryDateTime')
        .notEmpty()
        .withMessage('Missing Expiry Date Time')
        .bail()
        .isISO8601()
        .withMessage('Invalid Expiry Date Time')
        .bail()
        .custom(value => {
          if (new Date(value).getTime() <= Date.now()) {
            throw new Error('Expiry Date Time to be in Future');
          }
          return true;
        })
        .run(req),

      body('priority')
        .trim()
        .notEmpty()
        .withMessage('Missing Priority')
        .bail()
        .isIn(['Low', 'Normal', 'High'])
        .withMessage('Invalid Priority')
        .run(req),

      body('status')
        .trim()
        .notEmpty()
        .withMessage('Missing Status')
        .bail()
        .isIn(['Started', 'Pending', 'Completed'])
        .withMessage('Invalid Status')
        .run(req),

      body('assignedTo')
        .notEmpty()
        .withMessage('Missing AssignedTo')
        .bail()
        .isArray({min: 1})
        .withMessage('Minimum 1 AssignedTo Required')
        .run(req),

      body('assignedTo.*')
        .isMongoId()
        .withMessage('Invalid AssignedTo')
        .run(req),
    ]);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: missingErrorsLength } = missingErrors;

      if (missingErrorsLength > 0) {
        return res.status(400).json({
          error: missingErrors.join(', '),
        });
      }

      const otherErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: otherErrorsLength } = otherErrors;

      if (otherErrorsLength > 0) {
        return res.status(422).json({
          error: otherErrors.join(', '),
        });
      }
    }

    return next();
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}


export async function validateUpdateTask(req, res, next) {
  try {
    await Promise.all([
      body('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Task ID')
        .bail()
        .isMongoId()
        .withMessage('Invalid Task ID')
        .run(req),

      body('title')
        .trim()
        .optional()
        .run(req),

      body('description')
        .trim()
        .optional()
        .run(req),

      body('expiryDateTime')
        .optional()
        .isISO8601()
        .withMessage('Invalid Expiry Date Time')
        .bail()
        .custom(value => {
          if (new Date(value).getTime() <= Date.now()) {
            throw new Error('Expiry Date Time to be in Future');
          }

          return true;
        })
        .run(req),

      body('priority')
        .trim()
        .optional()
        .isIn(['Low', 'Normal', 'High'])
        .withMessage('Invalid Priority')
        .run(req),

      body('status')
        .trim()
        .optional()
        .isIn(['Started', 'Pending', 'Completed'])
        .withMessage('Invalid Status')
        .run(req),

      body('assignedTo')
        .optional()
        .isObject()
        .withMessage('Invalid AssignedTo')
        .bail()
        .custom((value) => {
            const { remove = [], add =[] }= value
            
            if (!Array.isArray(add) || !Array.isArray(remove)) {
                  return true; 
            }
            
            const isRemovingAddingSameUserId = add.some(id => remove.includes(id));

            if (isRemovingAddingSameUserId) {
              throw new Error('Trying to Add and Remove Same User Id to/from AssignedTo');
            }
            return true;
          })
        .run(req),

      body('assignedTo.add')
        .optional()
        .isArray()
        .withMessage('Invalid AssignedTo Add')
        .run(req),

      body('assignedTo.add.*')
        .optional()
        .isMongoId()
        .withMessage('Invalid User Id to Add to AssignedTo')
        .run(req),

      body('assignedTo.remove')
        .optional()
        .isArray()
        .withMessage('Invalid AssignedTo Remove')
        .run(req),

      body('assignedTo.remove.*')
        .optional()
        .isMongoId()
        .withMessage('Invalid User Id to Remove from AssignedTo')
        .run(req),

    ]);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: missingErrorsLength } = missingErrors;

      if (missingErrorsLength > 0) {
        return res.status(400).json({
          error: missingErrors.join(', '),
        });
      }

     const otherErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: otherErrorsLength } = otherErrors;

      if (otherErrorsLength > 0) {
        return res.status(422).json({
          error: otherErrors.join(', '),
        });
      }
    }

    return next();
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}


export async function validateDeleteTask(req, res, next) {
  try {
    await param('id')
      .notEmpty()
      .withMessage('Missing Task ID')
      .bail()
      .isMongoId()
      .withMessage('Invalid Task ID')
      .run(req);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: missingErrorsLength } = missingErrors;

      if (missingErrorsLength > 0) {
        return res.status(400).json({
          error: missingErrors.join(', '),
        });
      }

      const otherErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: otherErrorsLength } = otherErrors;

      if (otherErrorsLength > 0) {
        return res.status(422).json({
          error: otherErrors.join(', '),
        });
      }
    }

    return next();
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}


export async function validateGetTasks(req, res, next) {
  try {
    await param('id')
      .optional()
      .isMongoId()
      .withMessage('Invalid Task ID')
      .run(req);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: missingErrorsLength } = missingErrors;

      if (missingErrorsLength > 0) {
        return res.status(400).json({
          error: missingErrors.join(', '),
        });
      }

      const otherErrors = validationErrors
        .filter(error => {
          const { msg } = error;
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error;
          return msg;
        });

      const { length: otherErrorsLength } = otherErrors;

      if (otherErrorsLength > 0) {
        return res.status(422).json({
          error: otherErrors.join(', '),
        });
      }
    }

    return next();
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}
