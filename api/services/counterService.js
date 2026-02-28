const Counter = require("../db/models/counterModel");

/**
 * Obtiene el siguiente ID numérico secuencial para una entidad
 * @param {string} entityName - Nombre de la entidad (ej: 'cliente', 'vehiculo')
 * @returns {Promise<string>} - Retorna el siguiente ID numérico como cadena
 */
const getNextId = async (entityName) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      entityName,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    return counter.sequence_value.toString();
  } catch (error) {
    throw new Error(`Error al generar ID para ${entityName}: ${error.message}`);
  }
};

module.exports = { getNextId };
