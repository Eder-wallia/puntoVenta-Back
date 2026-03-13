const TrabajoRegistrado = require("../db/models/trabajoRegistradoModel");
const Cliente = require("../db/models/clientesModel");
const Vehiculo = require("../db/models/vehiculosModel");
const { generarCodigoRespuesta } = require("../services/responseService");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const TALLER_LOGO = path.resolve(__dirname, "../assets/logo_Taller.jpeg");
const TALLER_ENCARGADO = "Erik Alexis Morales Mercdo";
const TALLER_NOMBRE = "Taller y Refaccionaría M&C";
const TALLER_TELEFONO = "352 194 4826";
const TALLER_DIRECCION = "Ciudad del Sol, La Piedad, Michoacan";
const TALLER_EMAIL = "Erikolbrloko2510@gmail.com";

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
        replyText: "Cliente no encontrado",
      });
    }

    const vehiculo = await Vehiculo.findOne({ vehiculoId });
    if (!vehiculo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Vehículo no encontrado",
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
      replyText: "Trabajo registrado correctamente",
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
      .populate("createdBy", "", "Usuario")
      .populate("lastModifiedBy", "", "Usuario");

    if (!trabajo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Trabajo no encontrado",
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
        replyText: "Trabajo no encontrado",
      });
    }

    // Actualizar campos
    if (servicios) trabajoItem.servicios = servicios;
    if (refacciones) trabajoItem.refacciones = refacciones;
    if (manoDeObra) trabajoItem.manoDeObra = manoDeObra;
    if (observacionesTecnicas)
      trabajoItem.observacionesTecnicas = observacionesTecnicas;
    if (resumenFinanciero) trabajoItem.resumenFinanciero = resumenFinanciero;
    if (estatus) trabajoItem.estatus = estatus;
    if (lastModifiedBy) trabajoItem.lastModifiedBy = lastModifiedBy;

    trabajoItem.version += 1;
    trabajoItem.lastModifiedAt = new Date();

    await trabajoItem.save();

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      replyText: "Trabajo actualizado correctamente",
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
        replyText: "El estatus es requerido",
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
        replyText: `Estatus inválido. Debe ser uno de: ${validoEstatus.join(", ")}`,
      });
    }

    const trabajoCambio = await TrabajoRegistrado.findById(id);

    if (!trabajoCambio) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Trabajo no encontrado",
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
      replyText: "Estatus actualizado correctamente",
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
      { new: true },
    );

    if (!trabajo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Trabajo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      replyText: "Trabajo eliminado correctamente",
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
    });

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

// Obtener historial de trabajos por vehículo
exports.obtenerTrabajosPorVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    const trabajos = await TrabajoRegistrado.find({
      vehiculoId,
      deleted: false,
    }).sort({ createdAt: -1 });

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

exports.crearPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const trabajo = await TrabajoRegistrado.findById(id);

    if (!trabajo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Trabajo no encontrado",
      });
    }

    const vehicle = await Vehiculo.findOne({ vehiculoId: trabajo.vehiculoId });
    if (!vehicle) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Vehículo no encontrado",
      });
    }

    // Calcular totales
    const totalServicios =
      trabajo.servicios?.reduce((sum, s) => sum + (s.monto || 0), 0) || 0;
    const totalRefacciones =
      trabajo.refacciones?.reduce(
        (sum, r) => sum + (r.cantidad || 0) * (r.costoUnitario || 0),
        0,
      ) || 0;
    const totalManoObra =
      trabajo.manoDeObra?.reduce((sum, m) => sum + (m.precio || 0), 0) || 0;
    const totalPresupuesto = totalServicios + totalRefacciones + totalManoObra;

    // Crear documento PDF
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true, // permite ajustar páginas al final

      // margins: {
      //   top: 50,
      //   bottom: 10, // ← reduce el margen inferior
      //   left: 50,
      //   right: 50,
      // },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="historial-${vehicle.placas || id}.pdf"`,
    );
    doc.pipe(res);

    // ── PERFIL DEL TALLER ──────────────────────────────────────────────────────
    if (fs.existsSync(TALLER_LOGO)) {
      doc.image(TALLER_LOGO, -15, doc.y, { width: 250, height: 200, marginRight: 100 });
    }

    // Mover el cursor después del logo
    doc.moveDown(3.5);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("PERFIL DEL TALLER", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Nombre: ${TALLER_NOMBRE}`, { align: "center" })
      .text(`Encargado: ${TALLER_ENCARGADO}`, { align: "center" })
      .text(`Teléfono: ${TALLER_TELEFONO}`, { align: "center" })
      .text(`Dirección: ${TALLER_DIRECCION}`, { align: "center" })
      .text(`Email: ${TALLER_EMAIL}`, { align: "center" })
      .moveDown(1);

    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke().moveDown(0.5);

    // ── TÍTULO ─────────────────────────────────────────────────────────────────
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`HISTORIAL DE TRABAJO - ${vehicle.marca} ${vehicle.modelo}`, {
        align: "center",
      })
      .moveDown(0.5);

    // ── DATOS DEL VEHÍCULO ─────────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica");
    doc.text(`Vehículo: ${vehicle.marca} ${vehicle.modelo}`);
    doc.text(`Placa: ${vehicle.placas}`);
    doc.text(`Tipo: ${vehicle.tipo.toUpperCase()}`);
    doc.text(
      `Fecha de trabajo: ${new Date(trabajo.createdAt).toLocaleDateString("es-CO")}`,
    );
    doc.moveDown(0.2);

    // ── SERVICIOS ──────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("--- SERVICIOS ---").font("Helvetica");
    if (trabajo.servicios?.length > 0) {
      trabajo.servicios.forEach((s) => {
        doc.text(`${s.descripcion}: $${s.monto.toLocaleString()}`);
      });
    } else {
      doc.text("Sin servicios");
    }
    doc.moveDown(0.5);

    // ── REPUESTOS ──────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("--- REPUESTOS ---").font("Helvetica");
    if (trabajo.refacciones?.length > 0) {
      trabajo.refacciones.forEach((r) => {
        doc.text(
          `${r.nombre} (Qty: ${r.cantidad}): $${(r.cantidad * r.costoUnitario).toLocaleString()}`,
        );
      });
    } else {
      doc.text("Sin repuestos");
    }
    doc.moveDown(0.5);

    // ── MANO DE OBRA ───────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("--- MANO DE OBRA ---").font("Helvetica");
    if (trabajo.manoDeObra?.length > 0) {
      trabajo.manoDeObra.forEach((m) => {
        doc.text(`${m.descripcion}: $${m.precio.toLocaleString()}`);
      });
    } else {
      doc.text("Sin mano de obra");
    }
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke().moveDown(0.5);

    // ── TOTALES ────────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("--- TOTAL ---").font("Helvetica");
    doc.text(`Total Servicios: $${totalServicios.toLocaleString()}`);
    doc.text(`Total Refacciones: $${totalRefacciones.toLocaleString()}`);
    doc.text(`Total Mano de Obra: $${totalManoObra.toLocaleString()}`);
    doc
      .font("Helvetica-Bold")
      .text(`TOTAL PRESUPUESTO: $${totalPresupuesto.toLocaleString()}`)
      .font("Helvetica");
    doc.moveDown(0.2);

    // ── OBSERVACIONES Y ESTATUS ────────────────────────────────────────────────
    doc.text(
      `Observaciones Técnicas: ${trabajo.observacionesTecnicas || "Sin observaciones"}`,
    );
    doc.text(`Estatus: ${trabajo.estatus}`);

    // ← AGREGA ESTO ANTES DE doc.end()
    // const range = doc.bufferedPageRange();
    // for (let i = range.start; i < range.start + range.count; i++) {
    //   doc.switchToPage(i);
    // }
    // doc.flushPages();

    doc.end();
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};
