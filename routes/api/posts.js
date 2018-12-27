// middleware for routes
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

// load models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// post validation
const validatePostInput = require("../../validation/post");

// @route GET /api/posts/test
// @desc Tests post route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "Posts works" }));

// @route GET /api/posts/
// @desc gets all posts
// @access public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopost: "No posts found" }));
});

// @route GET /api/posts/:id
// @desc gets post by id
// @access public
router.get("/:post_id", (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopost: "No post found with that ID" })
    );
});

// @route POST /api/posts/
// @desc create posts
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // check for validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      username: req.body.username,
      location: req.body.location,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE /api/posts/:id
// @desc delets posts
// @access private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            // check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: "User not authorized" });
            }

            // delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ nopost: "No post found" }));
      })
      .catch(err => res.status(404).json({ nopost: "No post found" }));
  }
);

// @route POST /api/posts/like/:id
// @desc likes a post
// @access private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id).then(post => {
        // check if user already liked post
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }

        // add user id to likes array
        post.likes.unshift({ user: req.user.id });

        post.save().then(post => res.json(post));
      });
    });
  }
);

// @route DELETE /api/posts/like/:id
// @desc unlikes a post
// @access private
router.delete(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id).then(post => {
      // check if user already liked post
      if (
        post.likes.filter(like => like.user.toString() === req.user.id)
          .length === 0
      ) {
        return res.status(400).json({ notliked: "No like to remove" });
      }

      // get remove index
      const removeIndex = post.likes
        .map(item => item.user.toString())
        .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    });
  }
);

// @route POST /api/posts/comment/:id
// @desc comments on a post
// @access private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          username: req.body.username,
          location: req.body.location,
          user: req.user.id
        };

        // add to comments array
        post.comments.unshift(newComment);

        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ nopost: "Unable to add comment to post" })
      );
  }
);

// @route DELETE /api/posts/comment/:id/:comment_id
// @desc deletes comment from post
// @access private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Post.findById(req.params.post_id)
      .then(post => {
        // check if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          errors.comments = "That comment does not exist";
          return res.status(404).json(errors);
        }

        // get remove index
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));

        // TODO: allow post owners to delete any comments on their posts
        // check for post ownership
        // let postOwner = false;
        // if (post.user.toString() === req.user.id) {
        //   postOwner === true;
        //   // else, check if current user is deleting their comment
        // } else if (
        //   post.comments.filter(
        //     comment => comment.user.toString() === req.user.id
        //   ).length === 0
        // ) {
        //   errors.comments = "Can only delete your own comments";
        //   return res.status(400).json(errors);
        // }
      })
      .catch(err =>
        res.status(404).json({ nopost: "Unable to delete comment" })
      );
  }
);

// TODO get all comments route

module.exports = router;
