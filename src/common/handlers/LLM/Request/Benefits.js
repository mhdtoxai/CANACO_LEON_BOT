const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const shortenUrl = require('../../../../api/shortenUrl'); // Importas tu función existente

const BENEFITS_API_URL = process.env.BENEFITS_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

// Obtener beneficios de la API
const getBenefits = async (userId) => {
    const requestBody = {
        id: userId,
        token: TOKEN_LOGIN
    };

    try {
        const response = await axios.post(BENEFITS_API_URL, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("📥 Respuesta API Beneficios:", JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo beneficios:', error.message);
        return null;
    }
};

// Función para formatear fecha a DD/MM/AAAA
const formatDate = (isoDate) => {
    if (!isoDate) return "No disponible";
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// Enviar información de beneficios
const sendBenefitsInfo = async (userId, senderId) => {

    const benefitsData = await getBenefits(userId);

    // ✅ Verificamos correctamente que benefitsData no sea null o vacío
    if (!benefitsData || !benefitsData.saptivaBenefits || benefitsData.saptivaBenefits.length === 0) {
        console.log("⚠️ No se encontraron beneficios en la API.");
        await sendMessage(senderId, "⚠️ No hay beneficios disponibles en este momento.");
        return;
    }

    const benefits = benefitsData.saptivaBenefits; // ✅ Acceder correctamente a los beneficios
    const selectedBenefits = benefits.slice(0, 3); // Tomar hasta 3 beneficios

    for (const benefit of selectedBenefits) {
        const name = benefit.name || "Sin título";
        const description = benefit.description || "Sin descripción disponible";
        const url = benefit.url && benefit.url.startsWith("http") ? benefit.url : "No disponible";
        const createdAt = formatDate(benefit.createdAt); // ✅ Formatear fecha

        const message = `🎁 *${name}*\n`
            + `📝 *Descripción:* ${description}\n`
            + `📅 *Fecha de publicación:* ${createdAt}\n`
            + `🔗 *Más info:* ${url}`;

        try {
            console.log("📩 Enviando mensaje de beneficio...");
            await sendMessage(senderId, message);
        } catch (error) {
            console.error("❌ Error enviando beneficio:", error.message);
        }
    }

    // Enviar mensaje de "Ver más"
    const moreInfoUrl = benefitsData.url; 
    try {
        const shortUrl = await shortenUrl(moreInfoUrl);
        const moreInfoMessage = `🔗 *Ver más beneficios:* ${shortUrl}\n\n⚠️ Por seguridad: Recuerda no compartir esta liga, ni las anteriores. Es únicamente para tu uso personal.`;
        await sendMessage(senderId, moreInfoMessage);
    } catch (error) {
        console.error("❌ Error acortando o enviando la URL:", error.message);
        await sendMessage(senderId, `🔗 *Ver más beneficios:* ${moreInfoUrl}`); // Usa la URL original si hay error
    }
};

module.exports = sendBenefitsInfo;
