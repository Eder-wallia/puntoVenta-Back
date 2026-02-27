const bcrypt = require("bcrypt");

// Hashear contraseña
exports.hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    throw new Error(`Error al hashear contraseña: ${error.message}`);
  }
};

// Comparar contraseñas
exports.comparePassword = async (password, hash) => {
  try {
    const esValida = await bcrypt.compare(password, hash);
    return esValida;
  } catch (error) {
    throw new Error(`Error al comparar contraseña: ${error.message}`);
  }
};
