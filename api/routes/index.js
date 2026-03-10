const express = require("express");
const { login, validarToken, refrescarToken } = require("../middlewares/authMiddleware");
const clientesController = require("../controllers/clientesController");
const vehiculosController = require("../controllers/vehiculosController");
const trabajosController = require("../controllers/trabajosController");

const routerApi = (app) => {
  const router = express.Router();

  // Rutas de Autenticación
  router.post("/auth/login", login);
  router.post("/auth/refresh-token", refrescarToken);

  // Rutas de Clientes (protegidas con token)
  router.post("/clientes", validarToken, clientesController.crearCliente);
  router.get("/clientes", validarToken, clientesController.obtenerClientes);
  router.get("/clientes/:id", validarToken, clientesController.obtenerClientePorId);
//   router.put("/clientes/:id", validarToken, clientesController.actualizarCliente);
//   router.delete("/clientes/:id", validarToken, clientesController.eliminarCliente);

  // Rutas de Vehículos (protegidas con token)
  router.post("/vehiculos", validarToken, vehiculosController.crearVehiculo);
  router.get("/vehiculos", validarToken, vehiculosController.obtenerVehiculos);
  router.get("/vehiculos/:id", validarToken, vehiculosController.obtenerVehiculoPorId);
//   router.put("/vehiculos/:id", validarToken, vehiculosController.actualizarVehiculo);
//   router.delete("/vehiculos/:id", validarToken, vehiculosController.eliminarVehiculo);

  // Rutas de Trabajos (protegidas con token)
  router.post("/trabajos", validarToken, trabajosController.crearTrabajo);
  router.get("/trabajos", validarToken, trabajosController.obtenerTrabajos);
  router.get("/trabajos/:id", validarToken, trabajosController.obtenerTrabajoPorId);
  router.get("/trabajos/vehiculo/:vehiculoId", validarToken, trabajosController.obtenerTrabajosPorVehiculo);
//   router.put("/trabajos/:id", validarToken, trabajosController.actualizarTrabajo);
//   router.delete("/trabajos/:id", validarToken, trabajosController.eliminarTrabajo);
//   router.patch("/trabajos/:id/estatus", validarToken, trabajosController.cambiarEstatus);
//   router.get("/trabajos/cliente/:clienteId", validarToken, trabajosController.obtenerTrabajosPorCliente);
//   router.get("/trabajos/estatus/:estatus", validarToken, trabajosController.obtenerTrabajosPorEstatus);

  app.use("/api", router);
};

module.exports = routerApi;
