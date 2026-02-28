const TrabajoRegistrado = require("../db/models/trabajoRegistradoModel");
const Cliente = require("../db/models/clientesModel");
const Vehiculo = require("../db/models/vehiculosModel");
const { generarCodigoRespuesta } = require("../services/responseService");

// Crear trabajo registrado
exports.crearTrabajo = async (req, res) => {
  try {
    const {
      clienteId,
      vehiculoId,
      servicios,
      refacciones,
      manoDeObra,
      observacionesTecnicas,
      estatus,
      createdBy,
    } = req.body;

    // Validar referencias
    const cliente = await Cliente.findOne({ clienteId });
    if (!cliente) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Cliente no encontrado",
      });
    }

    const vehiculo = await Vehiculo.findById(vehiculoId);
    if (!vehiculo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Vehículo no encontrado",
      });
    }

    const nuevoTrabajo = new TrabajoRegistrado({
      clienteId,
      vehiculoId,
      servicios: servicios || [],
      refacciones: refacciones || [],
      manoDeObra: manoDeObra || [],
      observacionesTecnicas,
      resumenFinanciero: {
        serviciosTotal: 0,
        refaccionesTotal: 0,
        manoDeObraTotal: 0,
        totalPresupuesto: 0,
        anticipo: 0,
        restantePorPagar: 0,
      },
      estatus: estatus || "presupuesto",
      createdBy,
      deleted: false,
      version: 1,
    });

    await nuevoTrabajo.save();
    res.status(201).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 201,
      mensaje: "Trabajo registrado correctamente",
      trabajo: nuevoTrabajo,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener todos los trabajos (no eliminados)
exports.obtenerTrabajos = async (req, res) => {
  try {
    const trabajos = await TrabajoRegistrado.find({ deleted: false })
      .populate("clienteId")
      .populate("vehiculoId")
      .populate("createdBy")
      .populate("lastModifiedBy");

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener trabajo por ID
exports.obtenerTrabajoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const trabajo = await TrabajoRegistrado.findById(id)
      .populate("clienteId")
      .populate("vehiculoId")
      .populate("createdBy")
      .populate("lastModifiedBy");

    if (!trabajo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Trabajo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      trabajo,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Actualizar trabajo
exports.actualizarTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      servicios,
      refacciones,
      manoDeObra,
      observacionesTecnicas,
      resumenFinanciero,
      estatus,
      lastModifiedBy,
    } = req.body;

    const trabajoItem = await TrabajoRegistrado.findById(id);

    if (!trabajoItem) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Trabajo no encontrado",
      });
    }

    // Actualizar campos
    if (servicios) trabajoItem.servicios = servicios;
    if (refacciones) trabajoItem.refacciones = refacciones;
    if (manoDeObra) trabajoItem.manoDeObra = manoDeObra;
    if (observacionesTecnicas)
      trabajoItem.observacionesTecnicas = observacionesTecnicas;
    if (resumenFinanciero)
      trabajoItem.resumenFinanciero = resumenFinanciero;
    if (estatus) trabajoItem.estatus = estatus;
    if (lastModifiedBy) trabajoItem.lastModifiedBy = lastModifiedBy;

    trabajoItem.version += 1;
    trabajoItem.lastModifiedAt = new Date();

    await trabajoItem.save();

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Trabajo actualizado correctamente",
      trabajo: trabajoItem,
    });
  } catch (errorItem) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: errorItem.message,
    });
  }
};

// Cambiar estado del trabajo
exports.cambiarEstatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus, usuario } = req.body;

    if (!estatus) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        mensaje: "El estatus es requerido",
      });
    }

    const validoEstatus = [
      "presupuesto",
      "aprobado",
      "en_proceso",
      "terminado",
    ];
    if (!validoEstatus.includes(estatus)) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        mensaje: `Estatus inválido. Debe ser uno de: ${validoEstatus.join(", ")}`,
      });
    }

    const trabajoCambio = await TrabajoRegistrado.findById(id);

    if (!trabajoCambio) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Trabajo no encontrado",
      });
    }

    trabajoCambio.estatus = estatus;
    trabajoCambio.lastModifiedAt = new Date();
    if (usuario) trabajoCambio.lastModifiedBy = usuario;

    // Registrar en historial de estados
    if (trabajoCambio.historialEstados) {
      trabajoCambio.historialEstados.push({
        estado: estatus,
        fecha: new Date(),
        usuario,
      });
    }

    await trabajoCambio.save();

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Estatus actualizado correctamente",
      trabajo: trabajoCambio,
    });
  } catch (errorCambio) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: errorCambio.message,
    });
  }
};

// Eliminar trabajo (eliminación lógica)
exports.eliminarTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    const trabajo = await TrabajoRegistrado.findByIdAndUpdate(
      id,
      { deleted: true, lastModifiedAt: new Date() },
      { new: true }
    );

    if (!trabajo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Trabajo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Trabajo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener trabajos por cliente
exports.obtenerTrabajosPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const trabajos = await TrabajoRegistrado.find({
      clienteId,
      deleted: false,
    })
      .populate("vehiculoId")
      .populate("createdBy");

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener trabajos por estatus
exports.obtenerTrabajosPorEstatus = async (req, res) => {
  try {
    const { estatus } = req.params;
    const trabajos = await TrabajoRegistrado.find({
      estatus,
      deleted: false,
    })
      .populate("clienteId")
      .populate("vehiculoId");

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};
