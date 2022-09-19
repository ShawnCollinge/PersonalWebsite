const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shortSchema = new Schema({
  _id: String,
  url: String,
});

module.exports = mongoose.model("ShortURL", shortSchema);