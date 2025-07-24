const axios = require('axios');
const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../../services/getUserInfo');
const scheduleTask = require('../../../services/cloudTasksService');
const LLM = require('../../../handlers/LLM/LLM');

const handleConfirmCode = async (senderId, receivedMessage) => {
  console.log(`📩 Mensaje recibido de ${senderId}: ${receivedMessage}`);

  // 🕒 Si el usuario quiere que le recuerdes después
  if (receivedMessage === 'recordar') {
    const dateTime = new Date(Date.now() + 3600 * 1000); // 1 hora después
    const taskName = `recordatorio-${senderId}-${Date.now()}`;
    const payload = { senderId, type: 'recordar', taskName };

    await scheduleTask(payload, dateTime, taskName);
    await sendMessageTarget(senderId, '✅ Muy bien, yo te recuerdo en 1 hora.');
    return;
  }

  // 🚫 Si no respondió "sí", ejecutar LLM y enviar botones de nuevo
  if (receivedMessage !== 'si') {
    // Activar LLM directamente
    await LLM(senderId, receivedMessage);

    const randomMessages = [
      '🚀 ¿Listo para que te envíe el código? 📩',
      '📬 ¿Quieres que te envíe ahora el código de verificación?',
      '🔐 ¿Deseas recibir tu código de verificación en este momento?',
      '💡 Si ya estás listo, puedo enviarte el código. ¿Lo hacemos?',
      '🕘 ¿Te mando el código ahora o prefieres que te recuerde en 1 hora?'
    ];

    const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const buttons = [
      { id: 'si', title: 'Sí' },
      { id: 'recordar', title: 'Recordarme en 1h' }
    ];

    await sendMessageTarget(senderId, randomMsg, buttons);
    return;
  }

  // ✅ El usuario dijo "sí", se envía el código
  const userInfo = await getUserInfo(senderId);
  const { userId } = userInfo;

  await sendValidationCode(userId);

  const requestEmailMessage = 'Listo, código enviado. ⚠️⚠️ Por favor revisa el código en bandeja de entrada y SPAM (correo no deseado)⚠️⚠️';
  await sendMessageTarget(senderId, requestEmailMessage);

  const buttons = [
    { id: 'codigo_recibido', title: 'Sí, me llegó' },
    { id: 'codigo_no_recibido', title: 'No me llegó' }
  ];
  await sendMessageTarget(senderId, '🔑 ¿Te llegó el código de verificación?', buttons);

  await userService.updateUser(senderId, { state: 'confirmar_codigo_email', verified_email_code: 0 });
  console.log(`✅ Estado actualizado a 'confirmar_codigo_email'`);
};

// 📤 Función para enviar el código
const sendValidationCode = async (userId) => {
  try {
    console.log(`📨 Enviando código de validación a userId: ${userId}`);
    const response = await axios.post(
      process.env.VALIDATION_CODE,
      { id: userId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('✅ Código de validación enviado:', response.data);
  } catch (error) {
    console.error('❌ Error al enviar el código de validación:', error.message);
  }
};

module.exports = handleConfirmCode;
