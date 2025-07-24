const userService = require('../services/userService');

const getUserInfo = async (senderId) => {
  try {
    // Obtener datos del usuario desde la base de datos (MongoDB)
    const userData = await userService.getUser(senderId);

    // Verificar si se encontraron datos
    if (!userData) {
      console.warn(`No se encontraron datos para el usuario ${senderId}.`);
      return {};  // Retorna un objeto vacío si no hay datos
    }

    // Retornar userId y email_attempts sin valores por defecto
    return { 
      userId: userData.userId,  
      email_attempts: userData.email_attempts,
      code_attempts: userData.code_attempts,
      verified_email_code :userData.verified_email_code
    };
  } catch (error) {
    console.error(`Error al obtener información del usuario ${senderId}:`, error);
    return {};  // En caso de error, retorna un objeto vacío
  }
};

module.exports = getUserInfo;
