const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    role: String
})

module.exports = mongoose.model("Instructor", instructorSchema, "instructors");