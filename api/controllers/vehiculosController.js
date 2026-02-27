const Vehiculo = require("../db/models/vehiculosModel");

// Crear vehículo
exports.crearVehiculo = async (req, res) => {
  try {
    const { marca, modelo, color, placas, kilometraje } = req.body;

    if (!marca || !modelo || !color || !placas || !kilometraje) {
      return res.status(400).json({
        mensaje: "Marca, modelo, color, placas y kilometraje son requeridos",
      });
    }

    const vehiculoExistente = await Vehiculo.findOne({ placas });
    if (vehiculoExistente) {
      return res
        .status(400)
        .json({ mensaje: "El vehículo con esas placas ya está registrado" });
    }

    const nuevoVehiculo = new Vehiculo({
      marca,
      modelo,
      color,
      placas,
      kilometraje,
      deleted: false,
    });

    await nuevoVehiculo.save();
    res.status(201).json({
      mensaje: "Vehículo creado correctamente",
      vehiculo: nuevoVehiculo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los vehículos (no eliminados)
exports.obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ deleted: false });
    res.status(200).json({
      total: vehiculos.length,
      vehiculos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener vehículo por ID
exports.obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findById(id);

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.status(200).json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar vehículo
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, color, placas, kilometraje } = req.body;

    const vehiculo = await Vehiculo.findByIdAndUpdate(
      id,
      { marca, modelo, color, placas, kilometraje },
      { new: true, runValidators: true }
    );

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.status(200).json({
      mensaje: "Vehículo actualizado correctamente",
      vehiculo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.status(200).json({
      mensaje: "Vehículo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
