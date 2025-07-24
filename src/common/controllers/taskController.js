const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const handleConfirmCode = require('../handlers/Onboarding/Members/handleConfirmCode');
const handleReset = require('../services/handleReset');

const runTask = async (req, res) => {
  try {
    const { senderId, type, message} = req.body;
    console.log('📩 Tarea recibida en runTask:', req.body);

    if (type === 'text') {
      await sendMessage(senderId, message);
    } else if (type === 'recordar') {  // Asegúrate de que `else if` esté fuera del bloque anterior
      await handleConfirmCode(senderId);
    } else if (type === 'reset') {  // Asegúrate de que `else if` esté fuera del bloque anterior
      await handleReset(senderId);
    } else {
      console.error("❌ Tipo de mensaje no soportado o datos insuficientes");
    }

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('❌ Error al ejecutar la tarea:', error);
    res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = runTask;
