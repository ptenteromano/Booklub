// validation for logging in user
const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  const errors = {};

  // make at least an empty string
  data.text = !isEmpty(data.text) ? data.text : "";

  // text
  if (validator.isEmpty(data.text)) {
    errors.text = "Need to write something!";
  } else if (!validator.isLength(data.text, { min: 3, max: 400 })) {
    errors.text = "Post must be between 3 and 400 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
