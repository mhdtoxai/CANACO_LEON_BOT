const db = require('../database/mongoConfig');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');

// ID de organización obtenido del entorno (.env)
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;

async function handleReset(senderId) {
  try {
const resetMessage = '¡Todo listo para volver a empezar! Cuando estés listo, solo mándame un mensaje y comenzamos desde el principio. 😊';
    await sendMessage(senderId, resetMessage);

    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await db.collection('users').deleteOne({
      wa_id: senderId,
      organization_id: ORGANIZATION_ID
    });

    if (result.deletedCount === 1) {
      console.log(`✅ Usuario ${senderId} eliminado correctamente.`);
    } else {
      console.log(`⚠️ Usuario ${senderId} no encontrado para eliminación.`);
    }

  } catch (error) {
    console.error(`❌ Error al borrar el usuario ${senderId}:`, error);
  }
}

module.exports = handleReset;
