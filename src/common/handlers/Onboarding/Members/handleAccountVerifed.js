const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const sendContactMessage = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../../services/getUserInfo');
const shortenUrl = require('../../../../api/shortenUrl');

const USER_RETRIEVE_URL = process.env.USER_RETRIEVE_URL;
const PROFILE_API_URL = process.env.PROFILE_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

const handleAccountVerified = async (senderId) => {
  console.log(`🔍 Obteniendo información de la cuenta para ${senderId}`);

  const userInfo = await getUserInfo(senderId);
  const { userId } = userInfo;

  try {
    // ✅ Obtener datos de membresía
    const membershipUrl = `${USER_RETRIEVE_URL}?userId=${userId}`;
    console.log(`🌐 Llamando a la API de membresía: ${membershipUrl}`);
    const response = await axios.get(membershipUrl);
    const { name, organization, branch, status } = response.data;

    // ✅ Obtener URL del perfil (POST)
    const requestBody = {
      id: userId,
      token: TOKEN_LOGIN
    };

    const profileResponse = await axios.post(PROFILE_API_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    let profileUrl = profileResponse.data;

    // ✅ Acortar URL
    const shortUrl = await shortenUrl(profileUrl);


    // ✅ Traducir "ACTIVE" si aparece
    let statusEmoji = '';
    let statusText = status;

    if (status === 'ACTIVE') { statusEmoji = '✅'; statusText = 'Activo'; }
    else if (status === 'INACTIVO') { statusEmoji = '❌'; }
    else if (status === 'PROSPECTO') { statusEmoji = '🕓'; }


    const membershipMessage = `¡Bienvenido! A continuación te comparto los datos de tu membresía:\n\n` +
      `🔹 *Miembro:* ${name}\n` +
      `🏢 *Organización:* ${organization}\n` +
      // `📍 *Sección/Delegación/Capítulo:* ${branch}\n` +
      `Por favor verifica que tu información sea correcta. Si tienes algún cambio, puedes acceder a ${shortUrl} para actualizarla.`;

    await sendMessage(senderId, membershipMessage);
    console.log(`✅ Información de membresía enviada a ${senderId}`);

    // 💬 Mensaje adicional
    const additionalMessage = `🚀 *La nueva era tecnológica de CANACO LEÓN ha llegado.*\n\n` +
      `Por este medio puedes:\n\n` +
      `• 💳 Pagar tu membresía y facturarla\n` +
      `• 📄 Descargar tu constancia\n` +
      `• 🆔 Solicitar tu credencial virtual\n` +
      `• 🎓 Registrarte y pagar cursos de capacitación\n` +
      `• 🎁 Conocer tus beneficios\n` +
      `• 📅 Registrarte y pagar eventos\n` +
      `• 📰 Noticias de CANACO LEÓN y el sector\n` +
      `• ⚙️ Gestionar datos de tu perfil\n\n` +
      `*¿Por dónde quieres empezar?*`;

    await sendMessage(senderId, additionalMessage);
    console.log(`✅ Mensaje sobre nuevas funciones enviado a ${senderId}`);


    // 📇 Mensaje para tarjeta de contacto
    const contactNote = '📇✨ ¡No olvides guardarme entre tus contactos! 📱💾 Puedes guardarme como “Mi Asistente CANACO” 🛎️ para que siempre me encuentres con facilidad. 🔍🤝';

    await sendContactMessage(senderId, contactNote);
    console.log(`✅ Tarjeta de contacto enviada a ${senderId}`);

    await sendContactMessage(
      senderId,
      'Mi Asistente CANACO',
      '¡No olvides guardarme entre tus contactos! Puedes guardarme como “Mi Asistente CANACO” para que siempre me encuentres con facilidad.'
    );
    console.log(`✅ Tarjeta de contacto enviada a ${senderId}`);

  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error('❌ Error al obtener información:', errorMessage);
    await sendMessage(senderId, 'Hubo un problema al obtener tu información. Inténtalo de nuevo más tarde.');
  }
};

module.exports = handleAccountVerified;

