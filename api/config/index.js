require("dotenv").config();

const config = {
  dev: process.env.NODE_ENV !== "production",
  port: process.env.PORT || 3000,
  dbConnection: process.env.MONGO_URI,
};

module.exports = { config };
