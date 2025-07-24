const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');
const handleReset = require('../../../services/handleReset');


const handleAfilation = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    const respuesta = receivedMessage.toLowerCase();

    // ✅ Manejar botón "reset"
    if (respuesta === 'reset') {
        await handleReset(senderId);
        return;
    }

    if (respuesta !== 'si' && respuesta !== 'sí') {
        // 1️⃣ Ejecutar LLM por si el usuario hace una pregunta o comentario
        await LLM(senderId, receivedMessage);

        // 2️⃣ Luego, enviar mensaje aleatorio con botones para invitar de nuevo
        const retryMessages = [
            '😊 Nos encantaría que formes parte de la familia AMPI. 🤝 ¿Te gustaría conocer más sobre lo que hacemos? 🏡',
            '✨ ¡Unirte a AMPI puede ayudarte a crecer como profesional! ¿Quieres saber más? 📈',
            '🏠 ¿Te gustaría descubrir todos los beneficios de AMPI? Estamos para ayudarte. 🙌',
            '📈 Con AMPI puedes impulsar tu carrera y acceder a grandes oportunidades. ¿Te interesa saber cómo? 💼',
            '🎯 Ser parte de AMPI es dar un paso firme hacia tu crecimiento profesional. ¿Quieres más información? 🚀',
            '🔑 AMPI te conecta con una gran red de profesionales y nuevas oportunidades. ¿Te gustaría saber más? 🤝',
            '💬 ¡Estamos listos para resolver todas tus dudas sobre AMPI! ¿Te interesa conocer los beneficios? 🌟',
            '🌟 ¡Estás a un paso de formar parte de la red inmobiliaria más importante! ¿Te gustaría conocer cómo afiliarte? 🏘️'
        ];
        const randomMessage = retryMessages[Math.floor(Math.random() * retryMessages.length)];

        const buttons = [
            { id: 'si', title: 'Sí' },
            { id: 'reset', title: 'Volver a iniciar' }
        ];

        await sendMessageTarget(senderId, randomMessage, buttons);
        return;
    }

    // ✅ Usuario respondió "sí": avanzar con la información
    await userService.updateUser(senderId, { state: 'no_miembro_confirmacion' });
    console.log(`Estado actualizado a 'no_miembro_confirmacion'`);

    const info =
        '🏢 *La Asociación Mexicana de Profesionales Inmobiliarios (AMPI)* es el organismo más grande del sector inmobiliario en México, con más de *7,000 miembros* 👥🌎\n\n' +
        '✨ *¿Qué beneficios tienes al afiliarte?*\n' +
        '📚 • Capacitación continua y especializada 🎓\n' +
        '🎟️ • Acceso a eventos nacionales exclusivos 🧑‍💼🤝\n' +
        '💼 • Oportunidades de negocio y networking 🧩\n' +
        '🛡️ • Descuentos en seguros y servicios 📉\n' +
        '💰 • Acceso a capital de trabajo y herramientas financieras 💳\n\n' +
        '🤝 *Fortalecemos tu red profesional y la confianza en el sector inmobiliario.* 🏡🔑';

    await sendMessage(senderId, info);

    const buttons = [
        { id: 'si', title: 'Sí' },
        { id: 'reset', title: 'Volver a iniciar' }
    ];
    const interested = '¿Te interesa afiliarte? 🤔 ¡Tenemos promociones especiales para nuevos miembros! 🎉😊';

    await sendMessageTarget(senderId, interested, buttons);
};

module.exports = handleAfilation;
