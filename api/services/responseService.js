// Generar un código único para respuestas
exports.generarCodigoRespuesta = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RESPONSE-${timestamp}-${random}`;
};
