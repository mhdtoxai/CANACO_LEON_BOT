const userService = require('../../../services/userService');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');

const handleConfirmName = async (senderId, receivedMessage) => {
    console.log(`Nombre recibido de ${senderId}: ${receivedMessage}`);

    // Validar: al menos dos palabras, solo letras (con acentos y ñ)
    const nameRegex = /^([a-záéíóúñ]{2,})(\s[a-záéíóúñ]{2,})+$/i;

    if (!nameRegex.test(receivedMessage)) {
        // Siempre activar el LLM si el nombre es inválido
        await LLM(senderId, receivedMessage);

        // Mensajes aleatorios con emojis
        const invalidNameMessages = [
            '✍️ Para continuar, por favor escribe tu *nombre completo* (nombre y apellido) correctamente. 📝',
            '🙋‍♂️ Necesito tu *nombre completo* para seguir. Asegúrate de incluir al menos dos palabras, solo letras. 😊',
            '🧐 Recuerda, para continuar necesitamos un nombre válido. Ejemplo: *Carlos Mendoza*, *Ana Torres*. 💬'
        ];
        const randomMessage = invalidNameMessages[Math.floor(Math.random() * invalidNameMessages.length)];

        await sendMessage(senderId, randomMessage);
        return;
    }

    // Nombre válido: guardar exactamente como lo escribió el usuario
    await userService.updateUser(senderId, {
        state: 'no_miembro_phone',
        name: receivedMessage
    });
    console.log(`Estado actualizado a 'no_miembro_phone' y nombre guardado: ${receivedMessage}`);

    const askPhone = '¡Gracias! 🙌 Ahora, por favor, indícame tu número de teléfono (10 dígitos). 📱';
    await sendMessage(senderId, askPhone);
};

module.exports = handleConfirmName;

