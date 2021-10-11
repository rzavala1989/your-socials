const router = require('express').Router();
const User = require('../models/User');
const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select(
      'username email picture friends'
    );
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    const isFriend = user.friends.includes(req.params.id);

    const other = isFriend
      ? await User.findById(req.params.id)
          .populate('friends', '-email -password')
          .select('-email -password')
      : await User.findById(req.params.id)
          .populate('friends', '-email -password -friends')
          .select('-email -password');
    res.json(other);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
