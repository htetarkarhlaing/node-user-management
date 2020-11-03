const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  courseName: {
    type: String,
    required: true,
    unique: true,
  },
  instructor: {},
  duration: {
    type: Number,
    required: true,
  },
  lectures: [],
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema, "courses");
