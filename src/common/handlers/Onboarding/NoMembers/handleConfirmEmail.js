const userService = require('../../../services/userService');
const sendMessageTarget = require('../../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');

const handleConfirmEmail = async (senderId, receivedMessage) => {
    console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

    if (receivedMessage === 'no_correcto') {
        // Si el usuario dice "No es Correcto", pedirle que ingrese su correo nuevamente
        await userService.updateUser(senderId, { state: 'no_miembro_email' });
        console.log(`Estado actualizado a 'no_miembro_email' para corregir el correo`);

        const info = 'Por favor, vuelve a ingresar tu correo electrónico correctamente. ✉️🔄';
        await sendMessage(senderId, info);
        return;
    }

    if (receivedMessage !== 'correcto') {
        // Si el usuario no confirma "correcto", preguntar de nuevo con opciones
        const buttons = [
            { id: 'correcto', title: 'Sí, es Correcto' },
            { id: 'no_correcto', title: 'No es Correcto' }
        ];
        const randomMessages = [
            'Antes de responderte, ¿me confirmas si el correo que ingresaste es correcto? ✉️✔️',
            'Solo para estar seguros, ¿el correo que escribiste es el correcto? ✅📧',
            '¿Es correcto el correo que ingresaste? Necesito saberlo antes de ayudarte. 🧐✉️',
            'Confírmame si el correo que proporcionaste está bien, por favor. ✅📨',
            'Antes de continuar, ¿puedes decirme si el correo es correcto? 🙏📬'
        ];
        const randomIndex = Math.floor(Math.random() * randomMessages.length);
        const randomMessage = randomMessages[randomIndex];

        await sendMessageTarget(senderId, randomMessage, buttons);
        return;
    }

    // Si el usuario confirmó que es correcto, actualizar estado en la BD
    await userService.updateUser(senderId, { state: 'no_miembro_ayuda' });
    console.log(`Estado actualizado a 'no_miembro_ayuda'`);

    const info = '¡Muchas Gracias! 🙏 En breve, un miembro de nuestro equipo se comunicará contigo. 📞😊';
    await sendMessage(senderId, info);

    const buttons = [
        { id: 'si', title: 'Sí' },
        { id: 'no', title: 'No' }
    ];
    const interested = '¿Hay algo más en lo que pueda ayudarte? 🤔💬';

    await sendMessageTarget(senderId, interested, buttons);
};

module.exports = handleConfirmEmail;
