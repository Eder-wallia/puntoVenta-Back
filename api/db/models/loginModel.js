const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Usuario", loginSchema, "usuarios");
