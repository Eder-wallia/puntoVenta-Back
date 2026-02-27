const Usuario = require("../db/models/loginModel");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("../services/passwordService");
const { generarCodigoRespuesta } = require("../services/responseService");

const SECRET_KEY = process.env.SECRET_KEY;

// Middleware de Login - Validar usuario y crear token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que env envíe email y password
    if (!email || !password) {
      return res.status(400).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 400,
        mensaje: "Email y password son requeridos",
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      console.log("Usuario no encontrado con email:", email);
      return res.status(401).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 401,
        mensaje: "Credenciales inválidas",
      });
    }

    // Validar password con servicio
    const passwordValido = await comparePassword(password, usuario.password);
    if (!passwordValido) {
      console.log("Password inválido para email:", email);
      return res.status(401).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 401,
        mensaje: "Credenciales inválidas",
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      console.log("Usuario inactivo con email:", email);
      return res.status(401).json({
        replayCode: generarCodigoRespuesta(),
        estatus: 401,
        mensaje: "Usuario inactivo",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 500,
      error: error.message,
    });
  }
};

// Middleware de Validación de Token
exports.validarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 401,
      mensaje: "Token inválido o expirado",
      error: error.message,
    });
  }
};

// Middleware para refrescar token
exports.refrescarToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const nuevoToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 200,
      mensaje: "Token refrescado",
      token: nuevoToken,
    });
  } catch (error) {
    return res.status(401).json({
      replayCode: generarCodigoRespuesta(),
      estatus: 401,
      mensaje: "Token inválido",
      error: error.message,
    });
  }
};
