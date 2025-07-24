const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const contactData = {
  name: {
    formatted_name: "AMPI",
    first_name: "AMPI"
  },
  org: {
    company: "Empresa",
    title: "Otros"
  },
  phones: [
    {
      phone: "+5214772912824",
      type: "CELL",
      wa_id: "5214772912824"
    }
  ],
  emails: [
    {
      email: "ampi@ampi",
      type: "WORK"
    }
  ],
  urls: [
    {
      url: "https://ampi.org/",
      type: "WORK"
    }
  ]
};

const sendContactMessage = async (recipientId) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "contacts",
    contacts: [contactData]
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

    console.log('✅ Mensaje enviado:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar el mensaje:', error.message);
    if (error.response?.data) {
      console.error('Detalles:', error.response.data);
    }
  }
};

module.exports = sendContactMessage;
