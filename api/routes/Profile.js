const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const requireAuth = require('../middlewares/requireAuth');

router.get('/:uid', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.uid);
  let relationship = null;
  if (req.params.uid === user.id) {
    relationship = 'self';
  } else if (user.friends.includes(req.params.uid)) {
    relationship = 'friend';
  } else {
    relationship = 'other';
  }

  switch (relationship) {
    case 'self': {
      try {
        const posts = await Post.find({ user: user.id, parent: null })
          .populate('user', '-email -password')
          .sort({ createdAt: -1 });
        res.json({
          user: {
            uid: user.id,
            username: user.username,
            picture: user.picture,
            friends: user.friends,
          },
          posts,
          relationship,
        });
      } catch (err) {
        console.log(err);
        res.status(500).end();
      }
      break;
    }
    case 'friend': {
      try {
        const friend = await User.findById(req.params.uid).select(
          '-email -password'
        );
        const posts = await Post.find({
          user: req.params.uid,
          parent: null,
        })
          .populate('user', '-email -password')
          .sort({ createdAt: -1 });
        res.json({
          user: {
            uid: friend.id,
            username: friend.username,
            picture: friend.picture,
            friends: friend.friends,
          },
          posts,
          relationship,
        });
      } catch (err) {
        console.log(err);
        res.status(500).end();
      }
      break;
    }
    case 'other': {
      try {
        const other = await User.findById(req.params.uid).select(
          '-email -password -friends'
        );
        res.json({
          user: {
            uid: other.id,
            username: other.username,
            picture: other.picture,
          },
          relationship,
        });
      } catch (err) {
        console.log(err);
        res.status(500).end();
      }
      break;
    }
    default: {
      console.log('/profile/id Could not resolve user relationship');
      res.status(500).end();
    }
  }
});

module.exports = router;
