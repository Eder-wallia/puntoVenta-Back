const Vehiculo = require("../db/models/vehiculosModel");
const Cliente = require("../db/models/clientesModel");
const { generarCodigoRespuesta } = require("../services/responseService");
const { getNextId } = require("../services/counterService");

// Crear vehículo
exports.crearVehiculo = async (req, res) => {
  try {
    const { clienteId, tipo, marca, modelo, color, placas, kilometraje, observaciones } = req.body;

    // Validar campos obligatorios
    if (!clienteId || !tipo) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        replyText: "clienteId y tipo (moto/carro) son requeridos",
      });
    }

    // Validar que tipo sea válido
    if (!['moto', 'carro'].includes(tipo)) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        replyText: "Tipo debe ser 'moto' o 'carro'",
      });
    }

    // Generar ID secuencial automático
    let vehiculoId = await getNextId("vehiculo");
    
    // Validar que el ID no existe ya
    let vehiculoExistente = await Vehiculo.findOne({ vehiculoId });
    while (vehiculoExistente) {
      vehiculoId = await getNextId("vehiculo");
      vehiculoExistente = await Vehiculo.findOne({ vehiculoId });
    }

    // Validar que el cliente existe
    const cliente = await Cliente.findOne({ clienteId });
    if (!cliente) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Cliente no encontrado",
      });
    }

    const nuevoVehiculo = new Vehiculo({
      clienteId,
      vehiculoId,
      tipo,
      marca: marca || null,
      modelo: modelo || null,
      color: color || null,
      placas: placas || null,
      kilometraje: kilometraje || 0,
      observaciones: observaciones || null,
      deleted: false,
    });

    await nuevoVehiculo.save();
    res.status(201).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 201,
      replyText: "Vehículo creado correctamente",
      vehiculo: nuevoVehiculo,
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener todos los vehículos (no eliminados)
exports.obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ deleted: false }).populate("clienteId");
    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      total: vehiculos.length,
      vehiculos,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Obtener vehículo por ID
exports.obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findById(id).populate("clienteId");

    if (!vehiculo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Vehículo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      vehiculo,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Actualizar vehículo
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, marca, modelo, color, placas, kilometraje, observaciones } = req.body;

    // Validar tipo si se proporciona
    if (tipo && !['moto', 'carro'].includes(tipo)) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        replyText: "Tipo debe ser 'moto' o 'carro'",
      });
    }

    const updateData = {};
    if (tipo) updateData.tipo = tipo;
    if (marca) updateData.marca = marca;
    if (modelo) updateData.modelo = modelo;
    if (color) updateData.color = color;
    if (placas) updateData.placas = placas;
    if (kilometraje !== undefined) updateData.kilometraje = kilometraje;
    if (observaciones) updateData.observaciones = observaciones;

    const vehiculo = await Vehiculo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("clienteId");

    if (!vehiculo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Vehículo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      replyText: "Vehículo actualizado correctamente",
      vehiculo,
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Eliminar vehículo (eliminación lógica)
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (!vehiculo) {
      return res.status(404).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 404,
        replyText: "Vehículo no encontrado",
      });
    }

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      replyText: "Vehículo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};
