const axios = require('axios');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const shortenUrl = require('../../../../api/shortenUrl'); // Importas tu función existente

const COMMUNITY_API_URL = process.env.COMMUNITY_API_URL;
const TOKEN_LOGIN = process.env.TOKEN_LOGIN;

// Obtener publicaciones de la comunidad
const getCommunityPosts = async (userId) => {
    const requestBody = {
        id: userId,
        token: TOKEN_LOGIN
    };

    try {
        const response = await axios.post(COMMUNITY_API_URL, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("📥 Respuesta API Comunidad:", JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo publicaciones de la comunidad:', error.message);
        return null;
    }
};

// Enviar información de publicaciones de la comunidad
const sendCommunityInfo = async (userId, senderId) => {
    
    const communityData = await getCommunityPosts(userId);

    // Verificar si la respuesta es válida y contiene publicaciones
    if (!communityData || !Array.isArray(communityData.saptivaPublications) || communityData.saptivaPublications.length === 0) {
        console.log("⚠️ No se encontraron publicaciones en la API.");
        await sendMessage(senderId, "⚠️ No hay publicaciones disponibles en este momento.");
        return;
    }

    const posts = communityData.saptivaPublications.slice(0, 3); // Tomar hasta 3 publicaciones

    for (const post of posts) {
        const name = post.name || "Sin título";
        const description = post.description || "Sin descripción";
        const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-MX') : "No disponible";

        // Aquí eliminamos cualquier referencia a imágenes
        const message = `📰 *${name}*\n`
            + `📝 *Descripción:* ${description}\n`
            + `📅 *Fecha:* ${formattedDate}`;

        try {
            console.log("📩 Enviando mensaje de publicación...");
            await sendMessage(senderId, message);
        } catch (error) {
            console.error("❌ Error enviando publicación:", error.message);
        }
    }

    // Obtener el enlace para ver más publicaciones
    const moreInfoUrl = communityData.url;

    try {
        const shortUrl = await shortenUrl(moreInfoUrl);
        const moreInfoMessage = `🔗 *Ver más publicaciones:* ${shortUrl}\n\n⚠️ Por seguridad: No compartas esta liga. Es únicamente para tu uso personal.`;
        console.log("📩 Enviando mensaje de 'Ver más'...");
        await sendMessage(senderId, moreInfoMessage);
    } catch (error) {
        console.error("❌ Error enviando el mensaje de 'Ver más':", error.message);
    }
};

module.exports = sendCommunityInfo;
