// validation for logging in user
const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  const errors = {};

  // make at least an empty string
  data.username = !isEmpty(data.username) ? data.username : "";
  data.readerLevel = !isEmpty(data.readerLevel) ? data.readerLevel : "";

  // username
  if (validator.isEmpty(data.username)) {
    errors.username = "Username is required";
  } else if (!validator.isLength(data.username, { min: 2, max: 30 })) {
    errors.username = "Username must be between 2 and 30 characters";
  }

  // reader level
  if (validator.isEmpty(data.readerLevel)) {
    errors.readerLevel = "Please enter how often you read";
  } else if (
    data.readerLevel != "Not often" &&
    data.readerLevel != "Sometimes" &&
    data.readerLevel != "Frequently" &&
    data.readerLevel != "All the time!"
  ) {
    errors.readerLevel = "Invalid reader level";
  }

  // checking for valid URLs
  if (!isEmpty(data.website)) {
    if (!validator.isURL(data.website)) {
      errors.website = "Not a valid url";
    }
  }
  if (!isEmpty(data.youtube)) {
    if (!validator.isURL(data.youtube)) {
      errors.youtube = "Not a valid url";
    }
  }
  if (!isEmpty(data.twitter)) {
    if (!validator.isURL(data.twitter)) {
      errors.twitter = "Not a valid url";
    }
  }
  if (!isEmpty(data.instagram)) {
    if (!validator.isURL(data.instagram)) {
      errors.instagram = "Not a valid url";
    }
  }
  if (!isEmpty(data.facebook)) {
    if (!validator.isURL(data.facebook)) {
      errors.facebook = "Not a valid url";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
