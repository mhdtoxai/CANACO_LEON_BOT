const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const sendImageMessage = async (recipientId, imageUrl) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "image",
    image: {
      link: imageUrl
    }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GRAPH_API_TOKEN}`
        }
      }
    );

    console.log('✅ Mensaje imagen enviado:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar la imagen:', error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', error.response.data);
    }
  }
};

module.exports = sendImageMessage;
