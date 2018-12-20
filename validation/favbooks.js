// validation for logging in user
const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateFavBooksInput(data) {
  const errors = {};

  // make at least an empty string
  data.title = !isEmpty(data.title) ? data.title : "";
  data.author = !isEmpty(data.author) ? data.author : "";
  data.genre = !isEmpty(data.genre) ? data.genre : "";

  // title
  if (validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  // author
  if (validator.isEmpty(data.author)) {
    errors.author = "Author is required";
  }

  // genre
  if (validator.isEmpty(data.genre)) {
    errors.genre = "Genre is required";
  } else if (!validator.isLength(data.genre, { min: 2, max: 30 })) {
    errors.genre = "Genre must be between 2 and 30 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
