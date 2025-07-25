const userService = require('../../services/userService');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');

const randomMessages = [
  '🙏 Antes de poder ayudarte, necesito saber si eres miembro de CANACO LEÓN. Si no estás seguro, selecciona la opción “No estoy seguro” 🤝 y validaremos tu correo juntos.',
  '🧐 Para darte la mejor atención, dime primero si eres miembro de CANACO LEÓN. Si no lo sabes con certeza, elige “No estoy seguro” ✅ para que podamos validar tu correo.',
  '📌 Necesito confirmar si eres miembro de CANACO LEÓN para continuar. Si no estás seguro, no pasa nada: elige “No estoy seguro” 🔍 y revisamos tu información juntos.',
  '💬 Para poder ayudarte mejor, primero dime si eres miembro de CANACO LEÓN. Si tienes dudas, selecciona “No estoy seguro” 📧 y haremos la validación de tu correo.',
  '🙌 Realmente necesitamos saber si eres miembro para poder darte más información. Si no estás seguro, elige “No estoy seguro” 🌟 y validamos tu correo sin problema.'
];



const handlewelcome = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

  const lowerMessage = receivedMessage.toLowerCase();

  if (lowerMessage === 'si' || lowerMessage === 'no_se') {
    if (lowerMessage === 'no_se') {
      const unsureMessage = '🤔 Como no sabes si eres miembro o no y tienes dudas, vamos a verificarlo juntos. ¡No te preocupes!';
      await sendMessageTarget(senderId, unsureMessage);
    }

    await userService.updateUser(senderId, { 
      state: 'solicitud_email', 
      email_attempts: 0,
      member: true
    });
    console.log(`Estado actualizado a "solicitud_email" y member a true`);

    const requestEmailMessage = '✨ Por favor indícame el correo 📧 con el que estás registrado en CANACO LEÓN para poder ayudarte mejor. 🙌';
    await sendMessageTarget(senderId, requestEmailMessage);

  } else if (lowerMessage === 'no') {
    await userService.updateUser(senderId, { 
      state: 'no_miembro',
      member: false
    });
    console.log(`Estado actualizado a "no_miembro" y member a false`);

    const buttons = [
      { id: 'si', title: 'Sí' },
      { id: 'reset', title: 'Volver a iniciar' }
    ];
    
    const inviteMessage = '🤝 Nos encantaría que formes parte de la familia CANACO LEÓN 🏡.\n¿Te gustaría conocer más sobre lo que hacemos? 🌟';
    await sendMessageTarget(senderId, inviteMessage, buttons);

  } else {
    const buttons = [
      { id: 'si', title: 'Sí' },
      { id: 'no', title: 'No' },
      { id: 'no_se', title: 'No estoy seguro' }
    ];

    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    const randomMessage = randomMessages[randomIndex];

    await sendMessageTarget(senderId, randomMessage, buttons);
  }
};

module.exports = handlewelcome;

