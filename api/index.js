const express = require("express");
const cors = require("cors");
const { config } = require("./config");
const routerApi = require("./routes");
require("./db"); // Conexión a MongoDB

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificar conexión a BD
app.get("/health", (req, res) => {
  res.status(200).json({ 
    mensaje: "Servidor funcionando correctamente",
    timestamp: new Date()
  });
});

// Cargar rutas
routerApi(app);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✓ Servidor escuchando en http://localhost:${PORT}`);
  console.log(`✓ Base de datos: ${config.dbConnection}`);
  console.log(`✓ Entorno: ${config.dev ? "desarrollo" : "producción"}`);
});
