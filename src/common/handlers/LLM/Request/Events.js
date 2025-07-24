
const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const shortenUrl = require('../../../../api/shortenUrl'); // Importa la función para acortar URLs

const EVENTS_API_URL = process.env.EVENTS_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

// Obtener eventos de la API
const getEvents = async (userId) => {
    const requestBody = { id: userId, token: TOKEN_LOGIN };

    try {
        const response = await axios.post(EVENTS_API_URL, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("📥 Respuesta API Eventos:", response.data);
        return response.data || {}; // Devolver todo el JSON
    } catch (error) {
        console.error('❌ Error obteniendo eventos:', error.message);
        return {};
    }
};

// Enviar información de eventos
const sendEventsInfo = async (userId, senderId) => {

    const fullEventsData = await getEvents(userId);
    const eventsData = fullEventsData?.saptivaEvents || []; // Lista de eventos
    const moreEventsUrl = fullEventsData.url; // URL de "Ver más eventos"

    if (!eventsData.length) {
        await sendMessage(senderId, "⚠️ No hay eventos disponibles en este momento.");
        return;
    }

    // Tomar hasta 3 eventos
    const events = eventsData.slice(0, 3);

    for (const event of events) {
        const name = event.name || "Sin título";
        const startDate = event.dateConfiguration?.startDate?.split("T")[0] || "Fecha no disponible";
        const endDate = event.dateConfiguration?.endDate?.split("T")[0] || "Fecha no disponible";
        const modality = event.eventModality || "No especificada";
        const originalUrl = event.url || null;

        try {
            const shortUrl = originalUrl ? await shortenUrl(originalUrl) : "No disponible";

            const message = `🎟️ *${name}*\n`
                + `📆 *Fecha:* ${startDate} - ${endDate}\n`
                + `🌍 *Modalidad:* ${modality}\n`
                + `🔗 *Más info:* ${shortUrl}\n`;

            console.log("📩 Enviando evento...");
            await sendMessage(senderId, message);
        } catch (error) {
            console.error("❌ Error acortando URL o enviando evento:", error.message);
        }
    }

    // Enviar mensaje de "Ver más eventos" sin necesidad de verificar su existencia
    try {
        const shortUrl = await shortenUrl(moreEventsUrl);
        const moreInfoMessage = `🔗 *Ver más eventos:* ${shortUrl}\n⚠️ Por seguridad recuerda no compartir estas ligas, es únicamente para tu uso`;
        console.log("📩 Enviando mensaje de 'Ver más eventos'...");
        await sendMessage(senderId, moreInfoMessage);
    } catch (error) {
        console.error("❌ Error enviando el mensaje de 'Ver más eventos':", error.message);
    }
};

module.exports = sendEventsInfo;
