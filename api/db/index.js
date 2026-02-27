const { config } = require("../config");
const mongoose = require("mongoose");

const MONGO_URI = config.dbConnection;
mongoose.connect(MONGO_URI, {
  dbName: "PuntoVenta",
  maxPoolSize: 50,
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", function () {
  console.log("✓ DB connection successful");
});

db.once("disconnected", function () {
  console.log("DB connection disconnected");
});

module.exports = mongoose;
