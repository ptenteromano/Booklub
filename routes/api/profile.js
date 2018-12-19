// middleware for routes
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

// load validation
const validateProfileInput = require("../../validation/profile");

// load Profile and User models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET /api/profiles/test
// @desc tests profiles route
// @access public
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

// @route GET /api/profile
// @desc gets users profile
// @access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["username"])
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

// @route GET /api/profile/handle/:handle
// @desc get profile by handle
// @access public
router.get("/username/:username", (req, res) => {
  const errors = {};
  Profile.findOne({ "user.username": "req.params.username" })
    .populate("user", "username")
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
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
    if (req.body.firstname) profileFields.firstname = req.body.firstname;
    if (req.body.lastname) profileFields.lastname = req.body.lastname;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.age) profileFields.age = req.body.age;
    if (req.body.readerLevel) profileFields.readerLevel = req.body.readerLevel;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.career_status)
      profileFields.career_status = req.body.career_status;

    // split favAuth / favGenre into array
    if (typeof req.body.favAuth !== "undefined")
      profileFields.favAuth = req.body.favAuth.split(",");
    if (typeof req.body.favGenre !== "undefined")
      profileFields.favGenre = req.body.favGenre.split(",");

    if (req.body.website) profileFields.website = req.body.website;

    // social, set empty object first
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
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

module.exports = router;
