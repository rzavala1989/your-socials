const Feed = require('../models/Feed');

module.exports = async function validateFeed(req, res, next) {
  try {
    if (!req.params.feedId) {
      console.log(
        '"validateFeed" middleware requires feedId param in request url'
      );
      return res.status(500).end();
    }
    const feed = await Feed.findById(req.params.feedId).populate(
      'user',
      '-email -password'
    );
    switch (feed.audience.toString()) {
      case 'public': {
        next();
        return;
      }
      case 'friends': {
        if (
          feed.user._id.toString() === req.user.uid.toString() ||
          feed.user.friends.includes(req.user.uid)
        ) {
          next();
        } else {
          res.status(401).end();
        }
        return;
      }
      case 'invite': {
        if (feed.invites.includes(req.user.uid)) {
          next();
        } else {
          res.status(401).end();
        }
        return;
      }
      default: {
        console.log('DEFAULTING IN FEEDCHECK');
        res.status(400).end();
      }
    }
  } catch (err) {
    console.log('Error::FeedVerification', err);
    res.status(500).end();
  }
};
