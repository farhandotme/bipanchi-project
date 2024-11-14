const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  video: {
    type: Buffer,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("character", modelSchema);
