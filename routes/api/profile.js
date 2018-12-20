// middleware for routes
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

// load validations
const validateProfileInput = require("../../validation/profile");
const validateFavBooksInput = require("../../validation/favbooks");

// load Profile and User models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET /api/profiles/test
// @desc tests profiles route
// @access public
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

// @route GET /api/profile
// @desc gets current users profile
// @access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["firstname", "lastname", "email"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No Profile found for user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route GET /api/profile/all
// @desc get all profiles
// @access public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", "email")
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ noprofile: "There are no profiles" }));
});

// @route GET /api/profile/username/:username
// @desc get profile by username
// @access public
router.get("/username/:username", (req, res) => {
  const errors = {};
  Profile.findOne({ username: req.params.username })
    .populate("user", ["firstname", "lastname", "email"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ noprofile: "User not found" }));
});

// @route GET /api/profile/user/:user_id
// @desc get profile by user ID
// @access public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["firstname", "lastname", "email"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ noprofile: "User not found" }));
});

// @route POST /api/profile
// @desc creates or edits users profile
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.username) profileFields.username = req.body.username;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.age) profileFields.age = req.body.age;
    if (req.body.readerLevel) profileFields.readerLevel = req.body.readerLevel;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.career_status)
      profileFields.career_status = req.body.career_status;

    // split favAuth / favGenre into array
    if (typeof req.body.favAuth !== "undefined")
      profileFields.favAuth = req.body.favAuth
        .split(",")
        .map(item => item.trim());
    if (typeof req.body.favGenre !== "undefined")
      profileFields.favGenre = req.body.favGenre
        .split(",")
        .map(item => item.trim());

    if (req.body.website) profileFields.website = req.body.website;

    // social, set empty object first
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;

    Profile.findOne({
      $or: [{ user: req.user.id }, { username: req.body.username }]
    }).then(profile => {
      if (profile) {
        // check username uniqueness
        if (
          profile.user !== req.user.id &&
          profile.username === req.body.username
        ) {
          errors.username = "Username has already been taken";
          return res.status(400).json(errors);
        }
        // update found profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          {
            $set: profileFields
          },
          {
            new: true
          }
        ).then(profile => res.json(profile));
      } else {
        // create and save new profile
        new Profile(profileFields).save().then(profile => {
          res.json(profile);
        });
      }
    });
  }
);

// @route POST /api/profile/favbooks
// @desc add favorite books
// @access private
router.post(
  "/favbooks",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateFavBooksInput(req.body);

    // validation check
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newFavBook = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        datePublished: req.body.datePublished,
        publisher: req.body.publisher
      };

      // adding to front of favBook array
      profile.favBooks.unshift(newFavBook);

      // save and return the new profile
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route DELETE /api/profile/favbooks/:book_id
// @desc delete favorite books
// @access private
router.delete(
  "/favbooks/:book_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.favBooks
          .map(item => item.id)
          .indexOf(req.params.book_id);

        if (removeIndex === -1) {
          errors.nobooks = "No book to delete";
          return res.status(404).json(errors);
        }

        // splice out of array
        profile.favBooks.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(404).json({ favBooks: "Could not find that book" })
      );
  }
);

// @route DELETE /api/profile/
// @desc delete user and profile
// @access private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      })
      .catch(err =>
        res.status(404).json({ nodelete: "Could not delete user and profile" })
      );
  }
);

module.exports = router;
