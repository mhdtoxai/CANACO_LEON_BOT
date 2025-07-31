
const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const sendImageMessage = require('../../../services/Wp-Envio-Msj/sendImageMessage');
const { getPersonalInfo } = require('./PersonalInfo');
const shortenUrl = require('../../../../api/shortenUrl');

// 🔹 Obtenemos valores desde .env
const DIRECTORY_API_URL = process.env.DIRECTORY_API_URL;
const CREDENTIAL_BASE_URL = process.env.CREDENTIAL_BASE_URL;

// 🔹 Función que verifica si la credencial está visible
const checkCredentialVisibility = async (userId) => {
  const url = `${DIRECTORY_API_URL}?userId=${userId}`;

  try {
    const response = await axios.get(url);
    return response.data.credentialVisible;  // Retorna el estado de la credencial
  } catch (error) {
    console.error('❌ Error al verificar visibilidad de credencial:', error);
    return false; // Si hay un error, consideramos que no está visible
  }
};

// 🔹 Función que envía el mensaje cuando la credencial está lista
const sendCredentialAvailableMessage = async (senderId, userId) => {
  const credentialUrl = `${CREDENTIAL_BASE_URL}${userId}`;
  const botResponse = `🎉 **¡Tu credencial está lista!** 🎉\n\n`
    + `🔑 Puedes verla a detalle aquí: \n\n`
    + `👉 ${credentialUrl}\n\n`
    + `⚠️Por seguridad: no compartas esta liga, es únicamente para tu uso.\n\n`
    + `Si tienes alguna otra pregunta o necesitas ayuda, ¡no dudes en decírmelo! 😊💬`;

  await sendMessage(senderId, botResponse);
};

// Función que envía el mensaje para habilitar la visibilidad de la credencial
const sendEnableDirectoryMessage = async (senderId, userId) => {  

  const profileUrl = await getPersonalInfo(userId);
  const shortUrl = await shortenUrl(profileUrl);

  const botResponse = `🔑 Para darte acceso a tu credencial, necesitas habilitar la opción de ser *visible en el directorio*. Aquí tienes los pasos:

  1️⃣ Ingresa a tu perfil > Apartado de *editar tu perfil de miembro*, ve a la pestaña de *DATOS DEL DIRECTORIO*:  ${shortUrl}

  2️⃣ Datos de directorio > Activar switch *"Ser visible en el directorio"*.

  🖼️ Para poder visualizar tu *foto de perfil*, activa el switch *"Usar datos de miembro titular"* dentro del mismo apartado o selecciona la fotografía o el logotipo que deseas que aparezca.

  3️⃣ *Actívalo* > Asegúrate de que esté activado y *guarda los cambios*.

  ✅ *Cuando lo tengas listo, vuelve a solicitarme tu credencial* 🙌`;

  await sendMessage(senderId, botResponse);
};


// Función que envía la imagen para ayudar al usuario
const sendDirectoryImage = async (senderId) => {
  const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/AMPI%2FDirectorio.JPG?alt=media&token=7f4cc594-42cf-4b8c-94eb-6de6a78035b3';
  await sendImageMessage(senderId, imageUrl);
};

// Función principal que controla la lógica de habilitar el directorio
const enableDirectoryForUser = async (userId, senderId) => {
  // Verificamos si el userId está presente
  if (!userId) {
    // Si no hay userId, enviamos un mensaje indicando que se necesita ser miembro
    const botResponse = `⚠️ Para proporcionarte tu credencial virtual, necesitas ser miembro. Por favor, asegúrate de estar registrado y activo. Si tienes alguna duda general, déjamelo saber.`;
    await sendMessage(senderId, botResponse);
    return false; // Terminamos la función si no hay userId
  }

  // Verificamos si la credencial está visible
  const credentialVisible = await checkCredentialVisibility(userId);

  if (credentialVisible) {
    // Si está visible, enviamos el mensaje con la credencial
    await sendCredentialAvailableMessage(senderId, userId);
  } else {
    // Si no está visible o hubo un error, enviamos el mensaje de habilitación
    await sendEnableDirectoryMessage(senderId);
    await sendDirectoryImage(senderId); // Enviamos la imagen de ayuda
  }

  return true; // Retornamos true si todo salió bien
};

module.exports = enableDirectoryForUser;
