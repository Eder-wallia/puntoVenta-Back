const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema({
  descripcion: String,
  monto: Number,
});

const refaccionSchema = new mongoose.Schema({
  nombre: String,
  cantidad: Number,
  costoUnitario: Number,
  total: Number,
});

const manoDeObraSchema = new mongoose.Schema({
  descripcion: String,
  precio: Number,
});

const trabajoRegistradoSchema = new mongoose.Schema(
  {
    clienteId: {
      type: String,
      required: true,
    },
    vehiculoId: {
      type: String,
      ref: "Vehiculo",
      required: true,
    },

    servicios: [servicioSchema],
    refacciones: [refaccionSchema],
    manoDeObra: [manoDeObraSchema],

    observacionesTecnicas: String,

    resumenFinanciero: {
      serviciosTotal: Number,
      refaccionesTotal: Number,
      manoDeObraTotal: Number,
      totalPresupuesto: Number,
      anticipo: { type: Number, default: 0 },
      restantePorPagar: Number,
    },

    estatus: {
      type: String,
      enum: ["presupuesto", "aprobado", "en_proceso", "terminado"],
      default: "presupuesto",
    },

    historialEstados: [
      {
        estado: String,
        fecha: Date,
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deleted: { type: Boolean, default: false },

    // soporte offline
    version: { type: Number, default: 1 },
    lastModifiedAt: Date,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrabajoRegistrado", trabajoRegistradoSchema, "trabajo-register");
