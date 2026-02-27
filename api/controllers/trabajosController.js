const TrabajoRegistrado = require("../db/models/trabajoRegistradoModel");
const Cliente = require("../db/models/clientesModel");
const Vehiculo = require("../db/models/vehiculosModel");

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
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const vehiculo = await Vehiculo.findById(vehiculoId);
    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
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
      mensaje: "Trabajo registrado correctamente",
      trabajo: nuevoTrabajo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }

    res.status(200).json(trabajo);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const trabajo = await TrabajoRegistrado.findById(id);

    if (!trabajo) {
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }

    // Actualizar campos
    if (servicios) trabajo.servicios = servicios;
    if (refacciones) trabajo.refacciones = refacciones;
    if (manoDeObra) trabajo.manoDeObra = manoDeObra;
    if (observacionesTecnicas)
      trabajo.observacionesTecnicas = observacionesTecnicas;
    if (resumenFinanciero)
      trabajo.resumenFinanciero = resumenFinanciero;
    if (estatus) trabajo.estatus = estatus;
    if (lastModifiedBy) trabajo.lastModifiedBy = lastModifiedBy;

    trabajo.version += 1;
    trabajo.lastModifiedAt = new Date();

    await trabajo.save();

    res.status(200).json({
      mensaje: "Trabajo actualizado correctamente",
      trabajo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado del trabajo
exports.cambiarEstatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus, usuario } = req.body;

    if (!estatus) {
      return res.status(400).json({ mensaje: "El estatus es requerido" });
    }

    const validoEstatus = [
      "presupuesto",
      "aprobado",
      "en_proceso",
      "terminado",
    ];
    if (!validoEstatus.includes(estatus)) {
      return res.status(400).json({
        mensaje: `Estatus inválido. Debe ser uno de: ${validoEstatus.join(", ")}`,
      });
    }

    const trabajo = await TrabajoRegistrado.findById(id);

    if (!trabajo) {
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }

    trabajo.estatus = estatus;
    trabajo.lastModifiedAt = new Date();
    if (usuario) trabajo.lastModifiedBy = usuario;

    // Registrar en historial de estados
    if (trabajo.historialEstados) {
      trabajo.historialEstados.push({
        estado: estatus,
        fecha: new Date(),
        usuario,
      });
    }

    await trabajo.save();

    res.status(200).json({
      mensaje: "Estatus actualizado correctamente",
      trabajo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ mensaje: "Trabajo no encontrado" });
    }

    res.status(200).json({
      mensaje: "Trabajo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      total: trabajos.length,
      trabajos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
