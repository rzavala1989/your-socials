const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');

const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    user.friends.push(req.user.uid);
    const posts = await Post.find({
      user: { $in: user.friends },
      parent: null,
    })
      .populate('user', '-email -password')
      .sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

module.exports = router;
