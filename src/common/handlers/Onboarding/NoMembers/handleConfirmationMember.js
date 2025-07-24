const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');
const handleReset = require('../../../services/handleReset');

// ✅ Helper para hacer pausas
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleConfirmationMember = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    if (receivedMessage === 'reset') {
        await handleReset(senderId);
        return;
    }
    
    if (receivedMessage !== 'si') {
        // 1️⃣ Activar LLM primero (si es pregunta o comentario)
        await LLM(senderId, receivedMessage);

        // 2️⃣ Mensajes aleatorios para invitar a afiliarse
        const retryMessages = [
            '🤔 ¿Te gustaría formar parte de AMPI? ¡Tenemos promociones especiales para nuevos miembros! 🎉📢',
            '🏡 Ser parte de AMPI te abre muchas puertas. ¿Quieres afiliarte y recibir más info? 💼📩',
            '✨ ¡Es tu momento! ¿Te interesa sumarte a AMPI y disfrutar de todos sus beneficios? 🤝🎊',
            '🙌 Ser miembro de AMPI significa crecer profesionalmente y estar más conectado. ¿Te gustaría saber cómo unirte? 🌟',
            '📈 Con AMPI tienes acceso a herramientas, capacitación y una gran comunidad. ¿Quieres aprovecharlo? 🚀',
            '🤝 Formar parte de AMPI es pertenecer a una red de profesionales inmobiliarios. ¿Te interesa unirte? 🏠',
            '🔑 La membresía AMPI abre puertas a más oportunidades. ¿Deseas más información? 💬',
            '🎯 Estar en AMPI es estar un paso adelante en el sector inmobiliario. ¿Te gustaría saber cómo ser parte? 🏘️',
            '👥 AMPI es comunidad, apoyo y crecimiento. ¿Quieres recibir más información para afiliarte? 💡'
        ];

        const randomMessage = retryMessages[Math.floor(Math.random() * retryMessages.length)];

        const buttons = [
            { id: 'si', title: 'Sí' },
            { id: 'reset', title: 'Volver a iniciar' }
        ];

        await sendMessageTarget(senderId, randomMessage, buttons);
        return;
    }

    // ✅ Si respondió "si", continuar el flujo
    await userService.updateUser(senderId, { state: 'no_miembro_nombre' });
    console.log(`Estado actualizado a 'no_miembro_nombre'`);

    const excelent = '¡Excelente! 🎉 Solo requiero algunos datos para que nuestra área de miembros te contacte. 📞';
    const name = 'Indícame tu nombre completo, por favor. 📝';

    await sendMessage(senderId, excelent);
    await sendMessage(senderId, name);
};

module.exports = handleConfirmationMember;
