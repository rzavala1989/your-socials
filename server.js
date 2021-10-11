require('./api/models/User');
require('./api/models/Post');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/AuthRoutes');
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
app.use(authRoutes);

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
