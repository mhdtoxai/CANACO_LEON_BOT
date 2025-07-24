const userService = require('../../../services/userService');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const LLM = require('../../../handlers/LLM/LLM');

const handleprocessEmailRequest = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(receivedMessage)) {
        // 1️⃣ Activar el LLM (por si es una pregunta)
        await LLM(senderId, receivedMessage);

        // 2️⃣ Enviar mensaje aleatorio solicitando el correo nuevamente
        const invalidEmailMessages = [
            '❌ El correo no parece válido. Por favor, indícamelo nuevamente. Ejemplo: juan@email.com ✉️',
            '📧 Para continuar necesito un correo válido. Asegúrate que tenga un @ y termine en .com, .org, etc.',
            '🙋‍♀️ No pude validar ese correo. ¿Puedes enviarlo de nuevo? Ejemplo: maria@dominio.com'
        ];
        const randomMessage = invalidEmailMessages[Math.floor(Math.random() * invalidEmailMessages.length)];

        await sendMessage(senderId, randomMessage);
        return;
    }

    // ✅ Correo válido: guardar y continuar
    await userService.updateUser(senderId, {
        state: 'no_miembro_confirm_email',
        email: receivedMessage
    });
    console.log(`Estado actualizado a 'no_miembro_confirm_email' y correo guardado: ${receivedMessage}`);

    // Mostrar botones para confirmar el correo ingresado
    const buttons = [
        { id: 'correcto', title: 'Sí, es Correcto' },
        { id: 'no_correcto', title: 'No es Correcto' }
    ];

    await sendMessageTarget(
        senderId,
        `Por favor, confirma que tu correo esté bien escrito: ✉️ ${receivedMessage} ✅`,
        buttons
    );
};

module.exports = handleprocessEmailRequest;

