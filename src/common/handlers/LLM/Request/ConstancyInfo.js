const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const sendImageMessage = require('../../../services/Wp-Envio-Msj/sendImageMessage');
const shortenUrl = require('../../../../api/shortenUrl');  // Asegúrate de que esta función esté definida correctamente

const CONSTANCIA_API_URL = process.env.CONSTANCIA_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

const getConstanciaLink = async (userId) => {
    const requestBody = {
        id: userId,
        token: TOKEN_LOGIN
    };

    try {
        // Hacemos la solicitud POST a la API usando la URL de las variables de entorno
        const response = await axios.post(CONSTANCIA_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Obtenemos la URL de la constancia desde la respuesta
        const constanciaUrl = response.data; 
        return constanciaUrl;

    } catch (error) {
        console.error('Error al obtener el enlace de constancia:', error.message || error);
        return null;  // Si hay un error, retornamos null
    }
};

const sendConstanciaInfo = async (userId, senderId) => {
    const constanciaUrl = await getConstanciaLink(userId);

    // Aquí usamos la función para acortar la URL
    const shortUrl = await shortenUrl(constanciaUrl);
    
    const botResponse = `📄 *Aquí está tu constancia de membresía* 📄\n\n`
        + `Haz clic en el siguiente enlace para abrir tu constancia:\n\n`
        + `🔗 ${shortUrl}\n\n`
        + `✅ Una vez dentro, da clic en el botón *azul oscuro* que dice "*Constancia de membresía*", el cual está señalado con una *flecha roja* en la imagen que te adjunto a continuación.\n\n`
        + `¿Tienes dudas? Estoy para ayudarte 😊`;

    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/AMPI%2FConstancia.JPG?alt=media&token=f1d57f22-001b-4a7b-aa9a-8ad749eaa2bb';

    await sendMessage(senderId, botResponse);
    await sendImageMessage(senderId, imageUrl);
};

module.exports = sendConstanciaInfo;
