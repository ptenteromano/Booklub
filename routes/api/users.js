// middleware for routes
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// load user model
const User = require("../../models/User");

// @route GET /api/users/test
// @desc tests users route
// @access public
router.get("/test", (req, res) => res.json({ msg: "User works" }));

// @route POST /api/users/register
// @desc registers users
// @access public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check if email is already taken
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      if (user.email === req.body.email) {
        errors.email = "Email already exists";
      }
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
      });

      // generate hash and store that as password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          // save newUser to db
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET /api/users/login
// @desc login user / Returning json web token
// @access public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // find user by email
  User.findOne({ email }).then(user => {
    // check for user
    if (!user) {
      errors.email = "User email not found";
      return res.status(404).json(errors);
    }

    // check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // create jwt payload - all the data the token has
        const payload = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        };
        // sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          // 24 hours
          { expiresIn: 86400 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route GET /api/users/current
// @desc return current user using current token
// @access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      email: req.user.email
    });
  }
);

module.exports = router;
