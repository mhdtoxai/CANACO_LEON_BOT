const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');

const handlePendingMember = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

  try {
    // Procesar el mensaje con el modelo LLM
    await LLM(senderId, receivedMessage);

  } catch (error) {
    console.error(`[LLM] Error al procesar mensaje: ${error.message}`);

    // En caso de fallo, enviar un mensaje por defecto
    await sendMessage(senderId, 'Lo siento, no pude procesar tu mensaje en este momento. Inténtalo más tarde. 😓');
  }
};

module.exports = handlePendingMember;
