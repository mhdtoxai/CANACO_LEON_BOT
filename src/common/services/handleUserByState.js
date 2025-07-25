const userService = require('./userService');
const sendMessageTarget = require('./Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('./Wp-Envio-Msj/sendMessage');
const handlewelcome = require('../handlers/Onboarding/handlewelcome');



//miembros
const handleEmailRequest = require('../handlers/Onboarding/Members/handleEmailRequest');
const handleConfirmCode = require('../handlers/Onboarding/Members/handleConfirmCode');
const handleCodeValidation = require('../handlers/Onboarding/Members/handleCodeValidation');
const handleConfirmEmailCode = require('../handlers/Onboarding/Members/handleConfirmEmailCode');
const handleMemberVerifed = require('../handlers/Onboarding/Members/handleMemberVerifed');

//no miembros 

const handleAfilation = require('../handlers/Onboarding/NoMembers/handleAfilation');
const handleConfirmationMember = require('../handlers/Onboarding/NoMembers/handleConfirmationMember');
const handleConfirmName = require('../handlers/Onboarding/NoMembers/handleConfirmName');
const handlePhoneRequest = require('../handlers/Onboarding/NoMembers/handlePhoneRequest');
const handleprocessEmailRequest = require('../handlers/Onboarding/NoMembers/handleprocessEmailRequest');
const handleConfirmEmail = require('../handlers/Onboarding/NoMembers/handleConfirmEmail');
const handleMemberHelp = require('../handlers/Onboarding/NoMembers/handleMemberHelp');
const handlePendingMember = require('../handlers/Onboarding/NoMembers/handlePendingMember');





const handleUserByState = async (senderId, receivedMessage) => {
  const userDoc = await userService.getUser(senderId);

  if (!userDoc) {  // En MongoDB, si no existe, será `null`
    await userService.createUser(senderId);

    // Enviar mensaje normal antes de la tarjeta
    await sendMessage(senderId, '👋 ¡Hola! Soy el asistente inteligente de CANACO LEÓN 🤖. Estoy aquí para ayudarte en lo que necesites. 💬✨');

     const buttons = [
      { id: 'si', title: 'Sí' },
      { id: 'no', title: 'No' },
      { id: 'no_se', title: 'No estoy seguro' }
    ];


    // Enviar tarjeta con la pregunta modificada
    await sendMessageTarget(senderId, '🤝 Para comenzar, ¿me puedes indicar si ya eres miembro de CANACO LEÓN? 🏢', buttons);

  } else {
    const estado = userDoc.state;

    switch (estado) {
      case 'bienvenida':
        await handlewelcome(senderId, receivedMessage);
        break;



      // No miembros 
      case 'no_miembro':
        await handleAfilation(senderId, receivedMessage);
        break;
      case 'no_miembro_confirmacion':
        await handleConfirmationMember(senderId, receivedMessage);
        break;
      case 'no_miembro_nombre':
        await handleConfirmName(senderId, receivedMessage);
        break;
      case 'no_miembro_phone':
        await handlePhoneRequest(senderId, receivedMessage);
        break;
      case 'no_miembro_email':
        await handleprocessEmailRequest(senderId, receivedMessage);
        break;
      case 'no_miembro_confirm_email':
        await handleConfirmEmail(senderId, receivedMessage);
        break;
      case 'no_miembro_ayuda':
        await handleMemberHelp(senderId, receivedMessage);
        break;
      case 'no_miembro_pendiente':
        await handlePendingMember(senderId, receivedMessage);
        break;


      //Miembros
      case 'solicitud_email':
        await handleEmailRequest(senderId, receivedMessage);
        break;

      case 'enviar_codigo':
        await handleConfirmCode(senderId, receivedMessage);
        break;

      case 'confirmar_codigo_email':
        await handleConfirmEmailCode(senderId, receivedMessage);
        break;

      case 'validar_codigo':
        await handleCodeValidation(senderId, receivedMessage);
        break;


      case 'verificado':
        await handleMemberVerifed(senderId, receivedMessage);
        break;



    }
  }
};

module.exports = handleUserByState;

