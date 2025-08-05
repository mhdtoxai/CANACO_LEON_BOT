const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const userService = require('../../services/userService');
const verifyUserStatus = require('./verifyActiveMembership');
const processApiAction = require('./processApiAction');

const LLM = async (senderId, receivedMessage) => {
  const userDoc = await userService.getUser(senderId);
  if (!userDoc) {
    console.log(`Usuario no encontrado: ${senderId}`);
    return false;
  }

  const { userId, member, organization_id } = userDoc;

  const body = {
    from: senderId,
    query: receivedMessage,
    member,
    organization_id,
  };

  const llmUrl = 'https://llm-c4uot.ondigitalocean.app/canaco/';
  const intentUrl = 'https://canaco-leon-umihv.ondigitalocean.app/api/intent';
  const token = process.env.API_TOKEN_LLM;

  // ✅ Función central para llamar a la LLM y procesar respuesta
  const callLLM = async () => {
    const llmResponse = await axios.post(llmUrl, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const apiResponse = llmResponse.data;

    if (apiResponse?.response) {
      const responseText = apiResponse.response.trim();
      console.log('Respuesta limpia de la API LLM:', responseText);
      await sendMessage(senderId, responseText);
    }

    if (apiResponse?.action) {
      console.log(`Acción detectada: ${apiResponse.action}`);
      const isActive = await verifyUserStatus(userId, senderId);
      if (isActive) {
        await processApiAction(apiResponse.action, userId, senderId);
      } else {
        console.log(`Usuario ${userId} no está activo. No se ejecuta la acción.`);
      }
    }
  };

  try {
    // 🔍 Si es miembro, primero clasificamos con /intent
    if (member) {
      const intentResponse = await axios.post(intentUrl, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const intentData = intentResponse.data;
      console.log('Respuesta de /api/intent:', intentData);

      if (intentData?.action === 'pregunta_general') {
        await callLLM(); // 🧠 Pregunta informativa → llamar a LLM
      } else {
        const isActive = await verifyUserStatus(userId, senderId);
        if (isActive) {
          await processApiAction(intentData.action, userId, senderId);
        } else {
          console.log(`Usuario ${userId} no está activo. No se ejecuta la acción.`);
        }
      }

    } else {
      // 🔓 No miembro → ir directo a LLM
      await callLLM();
    }

    return true;

  } catch (error) {
    console.error('❌ Error en el proceso de LLM:', error.response?.data || error.message);
    return false;
  }
};

module.exports = LLM;
