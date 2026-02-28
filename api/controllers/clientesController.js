const Cliente = require("../db/models/clientesModel");
const { generarCodigoRespuesta } = require("../services/responseService");
const { getNextId } = require("../services/counterService");

// Crear cliente
exports.crearCliente = async (req, res) => {
  try {
    const { nombre, email, telefono, domicilio } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        mensaje: "Nombre y email son requeridos",
      });
    }

    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        mensaje: "El email ya está registrado",
      });
    }

    // Generar ID secuencial automático
    const clienteId = await getNextId("cliente");

    const nuevoCliente = new Cliente({
      clienteId: clienteId.toString(), // Convertir a string si es necesario
      nombre,
      email,
      telefono,
      domicilio,
      deleted: false,
    });

    await nuevoCliente.save();
    res.status(201).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 201,
      mensaje: "Cliente creado correctamente",
      cliente: nuevoCliente,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      total: clientes.length,
      clientes,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener cliente por ID
exports.obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Cliente no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      cliente,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, domicilio } = req.body;

    // Preparar datos a actualizar
    const datosActualizar = {};

    if (nombre) datosActualizar.nombre = nombre;
    if (email) datosActualizar.email = email;
    if (telefono) datosActualizar.telefono = telefono;
    if (domicilio) datosActualizar.domicilio = domicilio;

    const cliente = await Cliente.findByIdAndUpdate(
      id,
      datosActualizar,
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Cliente no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Cliente actualizado correctamente",
      cliente,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndDelete(id);

    if (!cliente) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        mensaje: "Cliente no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Cliente eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};
