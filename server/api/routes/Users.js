const router = require('express').Router();
const User = require('../models/User');

const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  const regex = new RegExp(`^${q}`, 'i');
  let users = await User.find({ username: regex }).select(
    'username _id picture'
  );
  users = users.filter((val) => val.username !== req.user.username);
  res.json(users);
});

router.get('/uid', requireAuth, async (req, res) => {
  const query = req.query.q;
  const userIds = query.split(',');

  const promises = [];
  for (let id of userIds) {
    promises.push(User.findById(id).select('-email -password'));
  }
  Promise.all(promises).then((vals) => {
    res.json({ users: vals });
  });
});

module.exports = router;
