const mongoose = require("mongoose");

const vehiculoSchema = new mongoose.Schema(
  {
    clienteId: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["moto", "carro"],
      required: true,
    },
    marca: String,
    modelo: String,
    color: String,
    placas: String,
    kilometraje: Number,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehiculo", vehiculoSchema, "vehiculos");
