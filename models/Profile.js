const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  location: {
    type: String
  },
  age: {
    type: Number
  },
  readerLevel: {
    type: String,
    required: false
  },
  favAuth: {
    type: [String]
  },
  favGenre: {
    type: [String]
  },
  favBooks: {
    type: [
      {
        title: {
          type: String,
          required: true
        },
        author: {
          type: String,
          required: true
        },
        genre: {
          type: String,
          required: true
        },
        datePublished: {
          type: Number
        },
        publisher: {
          type: String
        }
      }
    ]
  },
  career_status: {
    type: String
  },
  bio: {
    type: String
  },
  website: {
    type: String
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    instagram: {
      type: String
    },
    facebook: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// creating a model called 'profile' using this schema, exported as variable 'Profile'
module.exports = Profile = mongoose.model("profile", ProfileSchema);
