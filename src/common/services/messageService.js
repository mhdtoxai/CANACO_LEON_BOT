// const LLM = require('../handlers/LLM/LLM'); // Con minúsculas
const handleUserByState = require('./handleUserByState');
const handleReset = require('./handleReset');

exports.processMessage = async (body) => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = message?.from;

  if (message?.type === "text" || message?.type === "interactive" || message?.type === "button") {
    const receivedMessage = message.text?.body.toLowerCase() || message.interactive?.button_reply?.id || message.button?.payload || message.button?.text.toLowerCase();


    // Verificar si el mensaje es "reset"
    if (receivedMessage === "reset") {
      await handleReset(senderId); // Borra solo el documento del usuario
      return; // Salir de la función después de borrar el registro
    }
    // Manejar consultas generales que no están relacionadas
    // await LLM(senderId, receivedMessage); 

    // Manejar al usuario según su estado
    await handleUserByState(senderId, receivedMessage);
  }
};
