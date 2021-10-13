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

const requireAuth = require('./api/middlewares/requireAuth');

const mongo_uri =
  process.env.MONGODB_URI || 'mongodb://localhost:27020/your-socials';

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

// Connect db

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const mongoConnection = mongoose.connection;
mongoConnection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error:')
);

// Websockets

let socketCount = 0;
io.sockets.on('connection', (socket) => {
  socketCount++;
  console.log('user connected to socket', socket.id);
  console.log(socketCount, 'total connections');
  socket.on('authenticate', ({ token }) => {
    try {
      const user = jwt.verify(token, process.env.API_KEY);
      socketConnections[user.uid] = socket.id;
      socket.on('disconnect', () => {
        console.log('user disconnected');
        delete socketConnections[user.uid];
      });
    } catch (err) {
      console.log(err);
      socket.disconnect(true);
      return;
    }
  });
  socket.on('disconnect', (socket) => {
    socketCount--;
    console.log('user disconnected from socket', socket.id);
    console.log(socketCount, 'total connections');
  });
});

http.listen(PORT, () => console.log('app listening on port', PORT));
