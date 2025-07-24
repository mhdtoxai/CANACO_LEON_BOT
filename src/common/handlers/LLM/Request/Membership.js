const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const shortenUrl = require('../../../../api/shortenUrl'); // Importas tu función existente
const MEMBERSHIP_API_URL = process.env.MEMBERSHIP_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

const getMembershipPaymentLink = async (userId) => {
    const requestBody = {
        id: userId,
        token: TOKEN_LOGIN
    };

    try {
        const response = await axios.post(MEMBERSHIP_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // La API devuelve directamente la URL como string
        const paymentUrl = response.data;
        return paymentUrl;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
};

const sendMembershipPaymentLink = async (userId, senderId) => {

    const paymentUrl = await getMembershipPaymentLink(userId);
    // Usamos tu función existente para acortar la URL
    const shortUrl = await shortenUrl(paymentUrl);

    const botResponse = `💳 *¡Realiza el pago de tu membresía!* 💳\n\n`
        + `Haz clic aquí para pagar:\n\n`
        +`🔗 ${shortUrl}\n\n` 
        +`⚠️Por seguridad no compartas esta liga, es únicamente para tu uso.\n\n`
        +`¿Necesitas ayuda? Estoy aquí para ayudarte 😊`;
        

    await sendMessage(senderId, botResponse);
};

module.exports = sendMembershipPaymentLink;
