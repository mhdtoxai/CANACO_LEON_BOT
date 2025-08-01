
const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const shortenUrl = require('../../../../api/shortenUrl'); // Importas tu función existente

const PROFILE_API_URL = process.env.PROFILE_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

const getPersonalInfo = async (userId) => {
    const requestBody = {
        id: userId,
        token: TOKEN_LOGIN
    };

    try {
        const response = await axios.post(PROFILE_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },

        });

        // La API devuelve directamente la URL como string
        const infoUrl = response.data;

        return infoUrl;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};

const sendPersonalInfo = async (userId, senderId) => {

    const infoUrl = await getPersonalInfo(userId);

    // Usamos tu función existente para acortar
    const shortUrl = await shortenUrl(infoUrl);

    const botResponse =
         `📋 *Información de tu perfil* 📋\n\n`
          +`Aquí tienes tus datos actualizados:\n\n` 
          +`🔗 ${shortUrl}\n\n`
          +`⚠️Por seguridad: no compartas esta liga, es únicamente para tu uso.\n\n` 
          +`Revisa que todo esté correcto. Avisame si necesitas algo más 😊`;

    await sendMessage(senderId, botResponse);
};


module.exports = { sendPersonalInfo,getPersonalInfo };