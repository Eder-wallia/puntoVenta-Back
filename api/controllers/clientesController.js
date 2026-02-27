const Cliente = require("../db/models/clientesModel");

// Crear cliente
exports.crearCliente = async (req, res) => {
  try {
    const { nombre, email, password, role, activo } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Nombre, email y password son requeridos" });
    }

    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    const nuevoCliente = new Cliente({
      nombre,
      email,
      password,
      role: role || "usuario",
      activo: activo !== undefined ? activo : true,
    });

    await nuevoCliente.save();
    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente: nuevoCliente,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json({
      total: clientes.length,
      clientes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener cliente por ID
exports.obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, role, activo } = req.body;

    const cliente = await Cliente.findByIdAndUpdate(
      id,
      { nombre, email, password, role, activo },
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json({
      mensaje: "Cliente actualizado correctamente",
      cliente,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndDelete(id);

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json({
      mensaje: "Cliente eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
