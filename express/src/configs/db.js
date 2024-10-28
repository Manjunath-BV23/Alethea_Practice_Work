const mongoose = require("mongoose");

// step 1 :- connect to mongodb
const connect = () => {
  return mongoose.connect(
    // mongodb://127.0.0.1:27017/web14   --> For local connection
    "mongodb+srv://bvmanjunath:alethea0399@user-data.azgc4.mongodb.net/?retryWrites=true&w=majority&appName=user-data"
  );
};

module.exports = connect;