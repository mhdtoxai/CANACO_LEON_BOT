const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../../services/getUserInfo');
const handleReset = require('../../../services/handleReset');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const LLM = require('../../../handlers/LLM/LLM');

const handleConfirmEmailCode = async (senderId, receivedMessage) => {
  console.log(`📩 Mensaje recibido de ${senderId}: ${receivedMessage}`);

  const userInfo = await getUserInfo(senderId);
  const { verified_email_code } = userInfo;

  // ✅ Caso: el usuario confirma que recibió el código
  if (receivedMessage === 'codigo_recibido') {
    await sendMessage(senderId, '¡Qué bien que ya lo obtuviste! ✅⏳ Ahora, por favor, ingrésalo. 📝');
    await userService.updateUser(senderId, { state: 'validar_codigo' });
    console.log(`✅ Estado actualizado a 'validar_codigo'`);
    return;
  }

  // ❌ Si ya intentó una vez antes (y vuelve a fallar)
  if (verified_email_code >= 0) {
    await sendMessageTarget(senderId, 'No te preocupes, nadie se queda fuera. ✨ Te sugiero que te pongas en contacto directamente con CANACO LEÓN a través de su teléfono 📞+524777142800 o envíes un correo a 📧 informacion@canacoleon.com para revisar qué ocurre con tu correo electrónico, quizás necesites usar otro. 💡');
    await handleReset(senderId);
    return;
  }

  // 🧠 1️⃣ Activar LLM por si fue otra pregunta
  await LLM(senderId, receivedMessage);

  // 2️⃣ Actualizar el número de intentos
  await userService.updateUser(senderId, { verified_email_code: verified_email_code + 1 });

  // 3️⃣ Enviar un mensaje aleatorio + botones
  const notReceivedMessages = [
    '📥 A veces el correo se va a spam... ¿Ya revisaste ahí? 🧐',
    '🔎 Asegúrate de estar en tu correo correcto y revisa también las carpetas de promociones o no deseado.',
    '😅 A veces tarda unos minutos. Revisa de nuevo y dime si ya te llegó.',
    '🧪 Si no lo ves aún, intenta actualizar tu bandeja de entrada. ¡Puede estar escondido!',
    '📧 Confirma que el correo registrado es el que estás revisando. ¡Todo cuenta!'
  ];
  const randomInfo = notReceivedMessages[Math.floor(Math.random() * notReceivedMessages.length)];
  await sendMessageTarget(senderId, randomInfo);

  const buttons = [
    { id: 'codigo_recibido', title: 'Sí, me llegó' },
    { id: 'codigo_no_recibido', title: 'No me llegó' }
  ];
  await sendMessageTarget(senderId, '🔑 ¿Te llegó el código de verificación?', buttons);
};

module.exports = handleConfirmEmailCode;
