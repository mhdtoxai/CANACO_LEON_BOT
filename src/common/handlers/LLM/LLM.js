// LLM.js
const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const userService = require('../../services/userService');
const verifyUserStatus  = require('./verifyActiveMembership');
const processApiAction = require('./processApiAction');

const LLM = async (senderId, receivedMessage) => {
  const userDoc = await userService.getUser(senderId);
  if (!userDoc) {
    console.log(`Usuario no encontrado: ${senderId}`);
    return false;
  }

  // const estadoUsuario = userDoc.state;
  const userId = userDoc.userId;
  const member = userDoc.member;

  // const estadosExcluidos = [
  //   'bienvenida',
  //   'no_miembro',
  //   'no_miembro_confirmacion',
  //   'no_miembro_nombre',
  //   'no_miembro_phone',
  //   'no_miembro_email',
  //   'no_miembro_confirm_email',
  //   'no_miembro_ayuda',
  //   'solicitud_email',
  //   'confirmar_codigo_email',
  //   'enviar_codigo',
  //   'validar_codigo',
  // ];

  // if (estadosExcluidos.includes(estadoUsuario)) {
  //   console.log(`Estado ${estadoUsuario} excluido. No se ejecutará LLMOlya.`);
  //   return false;
  // }

  const url = 'https://api-ampi.saptiva.com/ampi';
  const token = process.env.AMPI_API_TOKEN;

  const body = {
    from: senderId,
    query: receivedMessage,
    member: member,
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const apiResponse = response.data;

    // 💬 Siempre enviamos la respuesta del LLM (si existe)
    if (apiResponse.response) {
      console.log('Respuesta de la API Olya:', apiResponse.response);
      await sendMessage(senderId, apiResponse.response);
    }

    // ⚠️ Solo si hay acción, verificamos si el usuario está activo
    if (apiResponse.action) {
      console.log(`Acción detectada: ${apiResponse.action}`);
      const isActive = await verifyUserStatus(userId, senderId);

      if (isActive) {
        await processApiAction(apiResponse.action, userId, senderId);
      } else {
        console.log(`Usuario ${userId} no está activo. No se ejecuta la acción.`);
        // El mensaje de estado inactivo ya lo maneja `verifyUserStatus`
      }
    }

    return true;
  } catch (error) {
    console.error('Error al llamar a la API:', error);
    return false;
  }
};

module.exports = LLM;