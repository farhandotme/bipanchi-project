const mongoose = require("mongoose");
const { dbname } = require("../contants.js");



const conn = async () => {
  try {
    const connectdb = await mongoose.connect(
      `${process.env.MONGO_URI}/${dbname}`
    );
    console.log(
      "connected to db connecttion Host : ",
      connectdb.connection.host
    );
  } catch (err) {
    throw err;
  }
};

module.exports = conn;
