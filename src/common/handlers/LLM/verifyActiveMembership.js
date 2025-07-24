const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const { USER_RETRIEVE_URL, CONSTANCIA_API_URL, TOKEN_LOGIN } = process.env;
const shortenUrl = require('../../../api/shortenUrl');

const verifyUserStatus = async (userId, senderId) => {
  if (!userId) {
    console.warn('⚠️ userId no está definido. Omitiendo verificación de estado.');
    await sendMessage(senderId, '🔎 Estoy procesando tu información pero aun no puedes consultar tus datos si no estas verificado...'); // Mensaje neutral y claro
    return false;
  }

  const membershipUrl = `${USER_RETRIEVE_URL}?userId=${userId}`;
  console.log(`🌐 Llamando a la API de membresía: ${membershipUrl}`);

  try {
    const response = await axios.get(membershipUrl);
    const { status } = response.data;

    if (status !== 'ACTIVE') {
      const constanciaLink = await getConstanciaLink(userId);
      const shortUrl = await shortenUrl(constanciaLink);
      const noactive = `⚠️ Lo siento, tu perfil no se encuentra activo. 😕 Pero no te preocupes, entra aquí para actualizar tu estatus 👉 ${shortUrl}`;
      await sendMessage(senderId, noactive);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al verificar el estado de la membresía:', error);
    await sendMessage(senderId, '❌ No pudimos verificar tu estado en este momento. Intenta más tarde.');
    return false;
  }
};

const getConstanciaLink = async (userId) => {
  const requestBody = {
    id: userId,
    token: TOKEN_LOGIN
  };

  try {
    const response = await axios.post(CONSTANCIA_API_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el enlace de constancia:', error.message || error);
    return null;
  }
};

module.exports = verifyUserStatus;
