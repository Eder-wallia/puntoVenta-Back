const Vehiculo = require("../db/models/vehiculosModel");

// Crear vehículo
exports.crearVehiculo = async (req, res) => {
  try {
    const { nombre, telefono, email, domicilio } = req.body;

    if (!nombre || !telefono || !email || !domicilio) {
      return res.status(400).json({
        mensaje: "Nombre, teléfono, email y domicilio son requeridos",
      });
    }

    const vehiculoExistente = await Vehiculo.findOne({ email });
    if (vehiculoExistente) {
      return res
        .status(400)
        .json({ mensaje: "El email ya está registrado" });
    }

    const nuevoVehiculo = new Vehiculo({
      nombre,
      telefono,
      email,
      domicilio,
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
    const { nombre, telefono, email, domicilio } = req.body;

    const vehiculo = await Vehiculo.findByIdAndUpdate(
      id,
      { nombre, telefono, email, domicilio },
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
