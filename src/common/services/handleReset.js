const db = require('../database/mongoConfig'); // Importamos la conexión de MongoDB
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage'); // Importa tu función de envío

async function handleReset(senderId) {
  try {
    // ✅ Primero, enviar el mensaje al usuario
    const resetMessage = '¡Perfecto! 🙌 Claro, no hay ningún problema. Volvamos a empezar. Escríbeme cuando quieras para comenzar de nuevo. 😊';
    await sendMessage(senderId, resetMessage);

    // ✅ Pequeño delay para asegurar entrega (opcional pero recomendado)
    await new Promise(resolve => setTimeout(resolve, 500));

    // ✅ Ahora sí, borrar el usuario
    const result = await db.collection('users').deleteOne({ _id: senderId });

    if (result.deletedCount === 1) {
      console.log(`Registro del usuario ${senderId} borrado correctamente.`);
    } else {
      console.log(`No se encontró el usuario ${senderId} para borrar.`);
    }
  } catch (error) {
    console.error(`Error al borrar el registro del usuario ${senderId}:`, error);
  }
}

module.exports = handleReset;