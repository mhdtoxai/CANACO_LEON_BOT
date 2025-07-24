const userService = require('../../../services/userService');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');

const handlePhoneRequest = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(receivedMessage)) {
        // 1️⃣ Ejecutar LLM por si fue una pregunta o comentario
        await LLM(senderId, receivedMessage);

        // 2️⃣ Luego pedir el número con un mensaje aleatorio
        const retryMessages = [
            'Para poder continuar, necesito tu número de teléfono con 10 dígitos. 📱',
            '¿Me puedes compartir tu número celular, por favor? Es necesario para seguir. 🙏',
            'Solo necesito tu número (10 dígitos) para continuar con el proceso. 😊'
        ];
        const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];

        await sendMessage(senderId, randomRetry);
        return;
    }

    // ✅ Número válido: guardar y seguir
    await userService.updateUser(senderId, { state: 'no_miembro_email', phone: receivedMessage });
    console.log(`Estado actualizado a 'no_miembro_email' y teléfono guardado: ${receivedMessage}`);

    await sendMessage(senderId, '¡Buen trabajo! 🎉 Por último, por favor, ingresa tu correo electrónico. ✉️');
};

module.exports = handlePhoneRequest;
