// sendMessageTarget.js

const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const sendMessageTarget = async (recipientId, messageText, buttons = []) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: buttons.length > 0 ? 'interactive' : 'text',
    [buttons.length > 0 ? 'interactive' : 'text']: buttons.length > 0 ? {
      type: 'button',
      body: {
        text: messageText
      },
      action: {
        buttons: buttons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title
          }
        }))
      }
    } : { body: messageText }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GRAPH_API_TOKEN}`
        },
      }
    );

    console.log('✅ Mensaje enviado:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar el mensaje:', error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', error.response.data);
    }
  }
};

module.exports = sendMessageTarget;
