const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const axios = require('axios'); // Importar axios para hacer el llamado a la API de backup
const scheduleTask = require('../../../services/cloudTasksService'); // Importamos la función de Google Cloud Tasks
const LLM = require('../../../handlers/LLM/LLM');

// Función principal que maneja la ayuda para los miembros
const handleMemberHelp = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    // Si el mensaje recibido es "Sí" o "No"
    if (receivedMessage.toLowerCase() === 'si' || receivedMessage.toLowerCase() === 'no') {

        // 1. Actualizar el estado del usuario
        await userService.updateUser(senderId, { state: 'no_miembro_pendiente' });
        console.log(`Estado actualizado a 'no_miembro_pendiente'`);

        // 2. Programar una tarea para el reset en 24 horas
        const taskName = `reset-${senderId}-${Date.now()}`;  // Nombre único para la tarea basado en senderId y timestamp
        const dateTime = new Date(Date.now() + 24 * 3600 * 1000);  // 24 horas de retraso
        const payload = {
            senderId,
            type: 'reset',  // Tipo de tarea
            taskName
        };
        await scheduleTask(payload, dateTime, taskName);
        console.log(`Tarea de reset programada para dentro de 24 horas: ${taskName}`);

        // 3. Realizar el backup del usuario
        try {
            const backupResponse = await axios.post('https://canaco-leon-umihv.ondigitalocean.app/api/backup', {
                 wa_id: senderId   // Enviar el wa_id del usuario para realizar el backup
            });

            console.log('Backup realizado con éxito:', backupResponse.data);
        } catch (error) {
            console.error('Error al realizar el backup:', error.message);
        }

        // 4. Enviar mensaje de confirmación al usuario
        await sendMessage(senderId, 'Entendido, estaré aquí por si me necesitas.');
        return;
    }

    // 1️⃣ Ejecutar LLM por si fue una pregunta o comentario
    await LLM(senderId, receivedMessage);
    // Si el mensaje no es "Sí" ni "No", volver a preguntar
    const buttons = [
        { id: 'si', title: 'Sí' },
        { id: 'no', title: 'No' }
    ];
    await sendMessageTarget(senderId, '¿Hay algo más en lo que pueda ayudarte? 🤔💬', buttons);
};

module.exports = handleMemberHelp;
