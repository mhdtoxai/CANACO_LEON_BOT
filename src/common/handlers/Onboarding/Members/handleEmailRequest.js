const axios = require('axios');
const userService = require('../../../services/userService');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../../services/getUserInfo');
const handleReset = require('../../../services/handleReset');
const LLM = require('../../../handlers/LLM/LLM');

const handleEmailRequest = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    const userInfo = await getUserInfo(senderId);
    let { email_attempts } = userInfo;

    // 📌 Si ya intentó 2 veces
    if (email_attempts >= 2) {
        await sendMessage(senderId, '🔍 No logro encontrar tu correo en mis registros.\n📞 Por favor comunícate con nuestros ejecutivos de CANACO León vía whatsapp al +524777142800 para atender tu caso.✅ \n✅ Te ayudaremos a confirmar tu correo para que puedas acceder al asistente inteligente 🤖.');
        await handleReset(senderId);
        return;
    }

    // 📧 Validar correo con regex simple
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(receivedMessage)) {
        // 1️⃣ Activar el LLM
        await LLM(senderId, receivedMessage);

        // 2️⃣ Enviar mensaje aleatorio solicitando un correo válido
        const invalidEmailMessages = [
            '⚠️ No pude validar tu información. Cuando tengas tu correo y estés seguro, vuelve a proporcionármelo, por favor.',
            '📧 No pude confirmar tus datos. Cuando tengas tu correo correcto, compártelo de nuevo para poder validarlo.',
            '💬 No logré verificar tu información. Por favor, vuelve a enviarme tu correo cuando lo tengas claro y estés seguro.',
            '🔍 No he podido validar tus datos. Cuando cuentes con tu correo correcto, vuelve a ingresarlo para seguir adelante.',
            '✅ No pude verificar tu información. Cuando tengas tu correo y estés seguro de que es el correcto, indícamelo nuevamente, por favor.'
        ];

        const randomMessage = invalidEmailMessages[Math.floor(Math.random() * invalidEmailMessages.length)];

        await sendMessage(senderId, randomMessage);
        return;
    }

    // ✅ Validar email con la API
    const cleanedEmail = encodeURIComponent(receivedMessage.trim());
    const userData = await validateEmailWithAPI(cleanedEmail);

    if (!userData || !userData.valid) {
        await userService.updateUser(senderId, {
            email_attempts: email_attempts + 1
        });

        const updatedUserInfo = await getUserInfo(senderId);
        console.log('Intentos fallidos después de la actualización:', updatedUserInfo.email_attempts);

        await sendMessage(senderId, '❌ El correo proporcionado no está registrado en CANACO LEÓN.\n📧 Por favor, intenta con otro correo válido.');
        return;
    }

    // 💾 Guardar datos del usuario
    await userService.updateUser(senderId, {
        email: userData.email,
        state: 'enviar_codigo',
        userId: userData.userId,
        code_attempts: 0,
    });

    console.log(`Datos guardados para ${senderId}:`, userData);

    // 📬 Confirmación e instrucciones
    await sendMessage(senderId, '✅ ¡Perfecto! Ahora te enviaré un código de verificación a tu correo 📬.\n\n📥 Es necesario que tengas acceso a tu bandeja de entrada y también revises el correo no deseado (spam) 🚫📧.');

    const buttons = [
        { id: 'si', title: 'Sí' },
        { id: 'recordar', title: 'Recordarme en 1h' }
    ];

    await sendMessageTarget(senderId, '¿Listo para que te lo envíe?', buttons);
};

// Función para validar email en backend
const validateEmailWithAPI = async (email) => {
    try {
        const url = `${process.env.API_URL_EMAIL}?email=${email}`;
        console.log(`Llamando a la API con URL: ${url}`);

        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Respuesta completa de la API:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error validando el correo:', error.response?.data || error.message);
        return null;
    }
};

module.exports = handleEmailRequest;
