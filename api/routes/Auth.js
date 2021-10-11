require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const router = express.Router();

//how long a token lasts in app
const tokenSessionLength = '2d';

//unauthorized response

const unauthorized = (res) => {
  res.status(401).json({ message: 'Unauthorized' });
};

//auth routes

router.post('/refresh', async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.API_KEY);
    const { email, uid, username } = decoded;
    const token = jwt.sign({ email, uid, username }, process.env.API_KEY, {
      expiresIn: tokenSessionLength,
    });
    res.json({ token, user: { email, uid, username } });
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    unauthorized(res);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log('No user found');
    return unauthorized(res);
  }

  bcrypt.compare(password, user.password, (err, same) => {
    if (err || !same) return unauthorized(res);
    const payload = {
      uid: user._id,
      username: user.username,
      picture: user.picture,
      friends: user.friends,
    };
    const token = jwt.sign(payload, process.env.API_KEY, {
      expiresIn: tokenSessionLength,
    });
    res.json({ token, user: payload });
  });
});

router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(304).end();
  const user = await User.create({
    username,
    email,
    password,
    friends: [],
  });
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    picture: user.picture,
  });
});

module.exports = router;
