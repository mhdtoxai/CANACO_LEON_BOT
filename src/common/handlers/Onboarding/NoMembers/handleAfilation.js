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
            '😊 Nos encantaría que formes parte de la familia CANACO LEÓN. 🤝 ¿Te gustaría conocer más sobre lo que hacemos? 🏡',
            '✨ ¡Unirte a CANACO LEÓN puede ayudarte a crecer como profesional! ¿Quieres saber más? 📈',
            '🏠 ¿Te gustaría descubrir todos los beneficios de CANACO LEÓN? Estamos para ayudarte. 🙌',
            '📈 Con CANACO LEÓN puedes impulsar tu carrera y acceder a grandes oportunidades. ¿Te interesa saber cómo? 💼',
            '🎯 Ser parte de CANACO LEÓN es dar un paso firme hacia tu crecimiento profesional. ¿Quieres más información? 🚀',
            '🔑 CANACO LEÓN te conecta con una gran red de profesionales y nuevas oportunidades. ¿Te gustaría saber más? 🤝',
            '💬 ¡Estamos listos para resolver todas tus dudas sobre CANACO LEÓN! ¿Te interesa conocer los beneficios? 🌟',
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
        '🏛️ *La Cámara Nacional de Comercio (CANACO)* es una de las organizaciones empresariales más importantes de México, con miles de afiliados en todo el país. 📈🇲🇽\n\n' +
        '✨ *¿Qué beneficios obtienes al afiliarte?*\n' +
        '📚 • Asesoría legal, fiscal y administrativa especializada ⚖️📊\n' +
        '🎟️ • Participación en eventos, ferias y exposiciones comerciales 🤝🧑‍💼\n' +
        '💼 • Promoción de tu negocio en redes y directorios empresariales 🌐📣\n' +
        '🏷️ • Acceso a convenios y descuentos con empresas e instituciones 💡🛒\n' +
        '💰 • Capacitación y herramientas para el crecimiento de tu empresa 📘🚀\n\n' +
        '🤝 *Impulsamos tu empresa, fortalecemos tu presencia y representamos tus intereses ante autoridades.* 🏬✅';


    await sendMessage(senderId, info);

    const buttons = [
        { id: 'si', title: 'Sí' },
        { id: 'reset', title: 'Volver a iniciar' }
    ];
    const interested = '¿Te interesa afiliarte? 🤔 ¡Tenemos promociones especiales para nuevos miembros! 🎉😊';

    await sendMessageTarget(senderId, interested, buttons);
};

module.exports = handleAfilation;
