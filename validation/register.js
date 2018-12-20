// validation for registering user
const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  const errors = {};

  // make at least an empty string
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  // first and last names optional
  if (data.firstname) {
    if (!validator.isLength(data.firstname, { min: 2, max: 30 })) {
      errors.firstname = "First name must be between 2 and 30 characters";
    }
  }
  if (data.lastname) {
    if (!validator.isLength(data.lastname, { min: 2, max: 30 })) {
      errors.lastname = "Last name must be between 2 and 30 characters";
    }
  }

  // email
  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // password
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  } else if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters";
  }

  // password2
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password is required";
  } else if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
