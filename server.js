require('./api/models/User');
require('./api/models/Post');
require('./api/models/Feed');
require('./api/models/Comment');
require('./api/models/FriendRequest');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;

// Declare routes
const authRoutes = require('./api/routes/Auth');
const postsRoutes = require('./api/routes/Posts');
const friendsRoutes = require('./api/routes/Friends');
const feedRoutes = require('./api/routes/Feed');
const homeRoutes = require('./api/routes/Home');
const profileRoutes = require('./api/routes/Profile');
const userRoutes = require('./api/routes/User');
const usersRoutes = require('./api/routes/Users');

const requireAuth = require('./middlewares/requireAuth');

let socketConnections = {};

// // Use Middleware to accept data from body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined'));

// Use middleware for websockets
app.use((req, res, next) => {
  req.io = io;
  req.sockets = socketConnections;
  next();
});

//Use routes
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/friends', friendsRoutes);
app.use('/feed', feedRoutes);
app.use('/home', homeRoutes);
app.use('/profile', profileRoutes);
app.use('/user', userRoutes);
app.use('/users', usersRoutes);

const mongo_uri =
  'mongodb+srv://rzavala1989:illmatic774@cluster0.vxxls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongouri);
mongoose.connection.on('connected', () => {
  console.log('connected to mongo instance');
});
mongoose.connection.on('error', (err) => {
  console.error('error connecting to mongo', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

app.listen(3000, () => {
  console.log('Listing to port 3000');
});
