const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const requireAuth = require('../middlewares/requireAuth');

// get users posts
router.get('/', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.user.uid,
      parent: null,
    }).populate('user', '-email, -password');
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// Create a post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { body, public, location } = req.body;
    const post = await Post.create({
      user: req.user.uid,
      body,
      public,
      location,
    });
    post.populate('user', (err, doc) => {
      const socketId = req.sockets[req.user.uid];
      if (socketId) {
        req.io.to(socketId).emit('post');
      }
      res.json(doc);
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

//delete post
router.delete('/:id', requireAuth, (req, res) => {
  User.findOne({ user: req.user.uid }).then((user) => {
    Post.findById(req.params.id)
      .then((post) => {
        //Delete
        post.remove().then(() => res.json({ success: true }));
      })
      .catch((err) => res.status(404).json({ postnotfound: 'No post found' }));
  });
});

//edit post
router.put('/:id', requireAuth, (req, res) => {
  User.findOne({ user: req.user.uid }).then((user) => {
    Post.findByIdAndUpdate(req.params.id, req.body)
      .then((post) => res.json({ msg: 'Updated successfully' }))
      .catch((err) =>
        res.status(400).json({ error: 'Unable to update the Database' })
      );
  });
});

// get post with comments
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'user',
      '-email -password'
    );
    const comments = await db.Comment.find({
      _id: { $in: post.comments },
    }).populate('user', '-email -password');
    res.json(comments);
  } catch (err) {
    res.status(500).end();
  }
});

// add comment to post
router.post('/:id', requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    const comment = await db.Comment.create({
      parent: req.params.id,
      user: req.user.uid,
      body,
    });
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { comments: comment.id } },
      { new: true }
    ).populate('user', '-email -password');
    // return created comment;
    res.status(201).json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

router.get('/:id/children', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const children = await Post.find({
      _id: { $in: post.children },
    }).populate('user', '-email -password');
    res.json(children);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});
// get likes for secific posts
router.get('/:id/likes', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'likes',
      '-email -password'
    );
    res.json({ likes: post.likes });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// post like
router.post('/:id/likes', requireAuth, async (req, res) => {
  try {
    const { like } = req.body;
    const post = like
      ? await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $addToSet: { likes: req.user.uid } },
          { new: true }
        ).populate('user', '-email -password')
      : await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $pull: { likes: req.user.uid } },
          { new: true }
        ).populate('user', '-email -password');
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

module.exports = router;
