import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {User} from '../model/user.js';

export async function getUsers(req, res) {
  try {
    const {params = {}, query = {} } = req;
    const {p} = params;
    const {userId} = req;
    const { search, page = 1 } = query;

    const user = await User.findById(userId)
                 .lean();

    if (!user) {
      return res.status(404).json({
        error: 'No User',
      });
    }
    if (p === 'me') {
      return res.status(200).json({
        message: user,
      });
    }

    const { username } = user;

    if (!p && !search && page) {
      if (username === 'ADMIN') {
        const users = await User.find()
          .lean();

        return res.status(200).json({
          message: users,
        });
      }
    }

    if(search && !p && page) {
    const pageNumber = Number(page);
    const limit = 5;
    const skip = (pageNumber - 1) * limit;

    const filterQuery = {};
    filterQuery.username = {
        $regex: search,
        $options: 'i',
      };
    
  const filteredUsers = await User.find(filterQuery)
        .select('_id username')
        .skip(skip)
        .limit(limit)
        .lean()

    return res.status(200).json({
      message: filteredUsers
    });
    }

    return res.status(403).json({
      error: 'No Authorization',
    });
  } catch (error) {
    const { message } = error;
    return res.status(500).json({
      error: message,
    });
  }
}

export async function register(req, res) {

  try {
    const { body } = req;
  const { username, email, password } = body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
      ],
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Register',
    });
  } catch (error) {
    const { message } = error;
    return res.status(500).json({
      error: message,
    });
  }
}

export async function login(req, res) {

  try {
    const {JWT_SECRET, COOKIE_SECURE, COOKIE_SAME_SITE, COOKIE_EXPIRY, JWT_EXPIRY} = process.env;
    const { body= {} } = req;
    const { email, password } = body;

    const existingUser = await User.findOne({ email })
      .select('+password').lean();

    if (!existingUser) {
      return res.status(404).json({
        error: 'No User',
      });
    }

    const {password: hashedPassword} = existingUser;

    const isPasswordCorrect = await bcrypt.compare(
      password,
      hashedPassword,
    );

    if (!isPasswordCorrect) {
      return res.status(422).json({
        error: 'Invalid Password',
      });
    }

    const { _id: userId } = existingUser;

    const signedToken = jwt.sign(
      { id: userId },
      JWT_SECRET,
      {
        expiresIn: JSON.parse(JWT_EXPIRY),//Seconds
      },
    );

    res.cookie('token', signedToken, {
      httpOnly: true,
      secure: JSON.parse(COOKIE_SECURE),
      sameSite: COOKIE_SAME_SITE,
      maxAge: JSON.parse(COOKIE_EXPIRY),//Milli-Seconds
    });

    res.set('Authorization', `Bearer ${signedToken}`);

    return res.status(200).json({
      message: 'Login',
    });
  } catch (error) {
    const { message } = error;
    return res.status(500).json({
      error: message,
    });
  }
}

export async function refresh(req, res) {
  try {  
    const {JWT_SECRET, COOKIE_SECURE, COOKIE_SAME_SITE, COOKIE_EXPIRY, JWT_EXPIRY} = process.env;
    const { userId } = req;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        error: 'No User',
      });
    }

    const signedToken = jwt.sign(
      { id: userId },
      JWT_SECRET,
      {
        expiresIn: JSON.parse(JWT_EXPIRY),//Seconds
      },
    );

    res.cookie('token', signedToken, {
      httpOnly: true,
      secure: JSON.parse(COOKIE_SECURE),
      sameSite: COOKIE_SAME_SITE,
      maxAge: JSON.parse(COOKIE_EXPIRY),//Milli-Seconds
    });

    res.set('Authorization', `Bearer ${signedToken}`);

    return res.status(200).json({
      message: 'Refresh',
    });
  } catch (error) {
    const { message } = error;
    return res.status(500).json({
      error: message,
    });
  }
}

export async function logout(req, res) {
  try {
    const {COOKIE_SECURE, COOKIE_SAME_SITE} = process.env;
    res.clearCookie('token', {
      httpOnly: true,
      secure: JSON.parse(COOKIE_SECURE),
      sameSite: COOKIE_SAME_SITE,
    });

    return res.status(200).json({
      message: 'Logout',
    });
  } catch (error) {
    const { message } = error;
    return res.status(500).json({
      error: message,
    });
  }
}