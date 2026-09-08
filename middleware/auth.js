import jwt from 'jsonwebtoken';
import {
  body,
  param,
  validationResult,
  checkExact,
  oneOf,
  query,
} from 'express-validator';
import {User} from '../model/user.js';

export async function auth(req, res, next) {
  try {
    const { env: { JWT_SECRET } = {} } = process || {};

    const { cookies: {token} = {}, headers: {authorization}= {} } = req || {};

    if (!token && !authorization) {
      return res.status(401).json({
        error: 'No Authentication Token',
      });
    }

    const signedToken = token || authorization
      // /...../ = Regex Delimiter, ^ = Start of String, \s = Whitespace Characters, + = One or More, i = Case Insensitive    
      .replace(/^Bearer\s+/i, '') 
      .trim();

    const { id } = jwt.verify(
      signedToken,
      JWT_SECRET
    );

    const user = await User.findById(id).lean();

    if(!user) {
      return res.status(404).json({
        error: 'No User',
      });
    }

    req.userId = id;

    return next();
  } catch (error) {
    const { message } = error || {};
    return res.status(500).json({
      error: message,
    });
  }
}

export async function validateGetUsers(req, res, next) {
  try {
    await oneOf(
      [
        [
          param('p')
            .trim()
            .equals('me')
            .withMessage('Invalid Parameter'),

          query().custom((_, { req }) => {
            const { query = {} } = req || {};
            if (Object.keys(query).length > 0) {
              throw new Error('Invalid Query');
            }
            return true;
          }),
        ],

        [
          param('p')
            .trim()
            .isEmpty()
            .withMessage('Invalid Parameter'),

          query().custom((_, { req }) => {
            const { query = {} } = req || {};
            if (Object.keys(query).length > 0) {
              throw new Error('Invalid Query');
            }
            return true;
          }),
        ],

        [
          param('p')
            .trim()
            .isEmpty()
            .withMessage('Invalid Parameter'),

          query('page')
            .trim()
            .notEmpty()
            .withMessage('Missing Query')
            .bail()
            .isInt({ min: 1 })
            .withMessage('Invalid Query'),

          query('search')
            .trim()
            .notEmpty()
            .withMessage('Missing Query')
            .bail()
            .isLength({ min: 5 })
            .withMessage('Invalid Query'),
        ],
      ],
      {
        message: 'Invalid Request',
      }
    ).run(req);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter((error) => {
          const { msg } = error || {};
          return msg.startsWith('Missing');
        })
        .map((error) => {
          const { msg } = error || {};
          return msg;
        });

      const { length: missingErrorsLength } = missingErrors;

      if (missingErrorsLength > 0) {
        return res.status(400).json({
          error: missingErrors.join(', '),
        });
      }

      const otherErrors = validationErrors
        .filter((error) => {
          const { msg } = error || {};
          return !msg.startsWith('Missing');
        })
        .map((error) => {
          const { msg } = error || {};
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
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}

export async function validateRegister(req, res, next) {
  try {
    await Promise.all([
      body('username')
        .trim()
        .notEmpty()
        .withMessage('Missing Username')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Minimum 5 Username Characters')
        .run(req),

      body('email')
        .trim()
        .notEmpty()
        .withMessage('Missing Email')
        .bail()
        .isEmail()
        .withMessage('Invalid Email')
        .run(req),

      body('password')
        .trim()
        .notEmpty()
        .withMessage('Missing Password')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Minimum 5 Password Characters')
        .run(req),
    ]);

    await checkExact().run(req);
    
    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error || {};
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error || {};
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
          const { msg } = error || {};
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error || {};
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
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}

export async function validateLogin(req, res, next) {
  try {
    await Promise.all([
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Missing Email')
        .bail()
        .isEmail()
        .withMessage('Invalid Email')
        .run(req),

      body('password')
        .trim()
        .notEmpty()
        .withMessage('Missing Password')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Minimum 5 Password Characters')
        .run(req),
    ]);

    await checkExact().run(req);

    const validationErrors = validationResult(req).array();

    const { length: validationErrorsLength } = validationErrors;

    if (validationErrorsLength > 0) {
      const missingErrors = validationErrors
        .filter(error => {
          const { msg } = error || {};
          return msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error || {};
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
          const { msg } = error || {};
          return !msg.startsWith('Missing');
        })
        .map(error => {
          const { msg } = error || {};
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
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}
