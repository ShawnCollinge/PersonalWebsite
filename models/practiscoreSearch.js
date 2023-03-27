const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const practiscoreSearchSchema = Schema({
  firstName: String,
  lastName: String,
  url: String
});


module.exports = mongoose.model("PractiscoreSearch", practiscoreSearchSchema);