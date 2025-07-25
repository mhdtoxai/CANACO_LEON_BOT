const axios = require('axios');
const userService = require('../../../services/userService');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../../services/getUserInfo');
const handleAccountVerifed = require('./handleAccountVerifed');
const LLM = require('../../../handlers/LLM/LLM');

const handleCodeValidation = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    const userInfo = await getUserInfo(senderId);
    let { userId, code_attempts } = userInfo;

    const userCode = receivedMessage.trim();

    // Si no es un código numérico de 6 dígitos
    if (!/^\d{6}$/.test(userCode)) {
        // 1️⃣ Activar LLM
        await LLM(senderId, receivedMessage);

        // 2️⃣ Mensajes aleatorios para formato inválido
        const invalidFormatMessages = [
            '🔢 El código debe contener exactamente 6 números. Inténtalo nuevamente por favor.',
            '❌ Ese código no parece correcto. Recuerda que son 6 dígitos. ¿Lo intentamos otra vez?',
            '🤖 Asegúrate de ingresar un código válido. Debe tener solo números y ser de 6 cifras.',
        ];
        const randomMessage = invalidFormatMessages[Math.floor(Math.random() * invalidFormatMessages.length)];
        await sendMessage(senderId, randomMessage);
        return;
    }

    // Validar el código con la API
    const validationResult = await validateCodeWithAPI(userId, userCode);
    console.log('Respuesta de validación:', validationResult);

    if (!validationResult || validationResult.message !== 'El código de validación ha sido confirmado correctamente') {
        code_attempts += 1;

        if (code_attempts >= 3) {
            await userService.updateUser(senderId, { code_attempts: 0 });
            await sendMessage(senderId, '❌ No he logrado validar el código de verificación. 📞 Por favor comunícate con nuestros ejecutivos de CANACO León vía whatsapp al +524777142800 para atender tu caso. 📲 Te ayudaremos a recibir tu código o verificar el problema. ✅');
            return;
        }

        await userService.updateUser(senderId, { code_attempts });

        await sendMessage(senderId, `❌ El código ingresado no es válido. Intento ${code_attempts}/3. 🔄 Por favor, intenta nuevamente. 📝`);
        return;
    }

    // Si el código es válido
    await userService.updateUser(senderId, { state: 'verificado', code_attempts: 0 });
    console.log(`✅ Estado actualizado a 'verificado' para el usuario ${senderId}`);

    await sendMessage(senderId, '🎉 Muchas gracias, tu cuenta ha sido validada exitosamente. ✅');
    await handleAccountVerifed(senderId);
};

const validateCodeWithAPI = async (userId, code) => {
    try {
        const url = process.env.CONFIRM_VALIDATION_CODE_URL;
        console.log(`Llamando a la API con URL: ${url}`);

        const requestBody = { id: userId, validationCode: code };
        const response = await axios.post(url, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        console.error('Error validando el código:', error.response?.data || error.message);
        return null;
    }
};

module.exports = handleCodeValidation;
