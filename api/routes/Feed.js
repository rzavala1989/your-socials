const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Feed = require('../models/Feed');
const requireAuth = require('../middlewares/requireAuth');
const validateFeed = require('../middlewares/validateFeed');
const validatePost = require('../middlewares/validatePost');

// Get Feeds
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    const { friends } = user;
    if (!friends) {
      const feeds = await Feed.find({ audience: 'public ' })
        .populate('user', '-email -password')
        .sort({ _id: -1 });

      console.log('FEEDS', feeds.length);
      res.json(feeds);
    } else {
      friends.push(user.id);
      const feeds = await Feed.find({
        audience: 'public',
      })
        .populate('user', '-email -password')
        .sort({ _id: -1 });

      console.log('FEEEDS', feeds.length);
      res.json(feeds);
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// Create Feed
router.post('/', requireAuth, async (req, res) => {
  try {
    const { location, audience, title, description } = req.body;
    const feed = await Feed.create({
      user: req.user.uid,
      location,
      audience,
      title,
      description,
    });
    feed.populate('user', (err, doc) => {
      if (err) {
        res.status(500).end();
      } else {
        res.status(201).json(doc);
      }
    });
  } catch (err) {
    res.status(500).end();
  }
});

// Get Feed and Posts
router.get('/:feedId', requireAuth, validateFeed, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.feedId).populate(
      'user',
      '-email -password'
    );
    const posts = await Post.find({
      _id: { $in: feed.posts },
    }).populate('user', '-email -password');
    res.json({ feed, posts });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// Post to a feed
router.post('/:feedId', requireAuth, validateFeed, async (req, res) => {
  try {
    const { body } = req.body;
    const post = await Post.create({
      user: req.user.uid,
      feed: req.params.feedId,
      body,
    });
    const updatedFeed = await Feed.findByIdAndUpdate(
      req.params.feedId,
      { $push: { posts: post.id } },
      { new: true }
    ).populate('user', '-email -password');

    post.populate('user', '-email -password', (err, doc) => {
      if (err) throw err;
      res.status(201).json({ feed: updatedFeed, post: doc });
    });
  } catch (err) {
    res.status(500).end();
  }
});

// get a specific post
router.get(
  '/:feedId/:postId',
  requireAuth,
  validateFeed,
  validatePost,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId).populate(
        'user',
        '-email -password'
      );
      const comments = await Post.find({
        _id: { $in: post.comments },
      }).populate('user', '-email -password');

      res.json({ post, comments });
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

// Post a comment
router.post(
  '/:feedId/:postId',
  requireAuth,
  validateFeed,
  validatePost,
  async (req, res) => {
    try {
      const { postId, feedId } = req.params;
      const { body } = req.body;
      const post = await Post.create({
        user: req.user.uid,
        parent: postId,
        feed: feedId,
        body: body,
      });
      // no await is fine here
      const parent = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { comments: post._id },
        },
        { new: true }
      ).populate('user', '-email -password');
      post.populate('user', '-email -password', (err, doc) => {
        if (err) throw err;
        res.json({ parent, post: doc });
      });
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

module.exports = router;
