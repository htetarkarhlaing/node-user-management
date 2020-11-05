const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  courseName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
      type: String,
      require: true
  },
  instructorDetail : {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
  },
  lectures: [
    {
      title: {
        type: String,
        required: true
      },
      link: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      }
    }
  ],
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema );
