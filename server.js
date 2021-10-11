require('./models/User');
require('./models/Track');

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/AuthRoutes');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

// // Use Middleware to accept data from body
app.use(express.json({ extended: false }));

//Use routes
app.use(authRoutes);

const mongouri =
  'mongodb+srv://rzavala1989:Marcel2018!@cluster0.ayefg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

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
