const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    clienteId: { type: String, unique: true, required: true },
    nombre: { type: String, required: true },
    telefono: String,
    email: String,
    domicilio: String,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cliente", clienteSchema, "clientes");