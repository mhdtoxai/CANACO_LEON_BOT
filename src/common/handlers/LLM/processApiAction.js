// services/processApiAction.js
const enableDirectoryForUser = require('./Request/Credential');
const sendMembershipPaymentLink = require('./Request/Membership');
const { sendPersonalInfo } = require('./Request/PersonalInfo');
const sendEventsInfo = require('./Request/Events');
const sendBenefitsInfo = require('./Request/Benefits');
const sendCommunityInfo = require('./Request/Community');
const sendConstanciaInfo = require('./Request/ConstancyInfo');

const processApiAction = async (action, userId, senderId) => {
  // Objeto de mapeo para las acciones
  const actions = {
    'crear_credenciales': async () => await enableDirectoryForUser(userId, senderId),
    'solicitud_eventos': async () => await sendEventsInfo(userId, senderId),
    'informacion_membresia': async () => await sendMembershipPaymentLink(userId, senderId),
    'informacion_perfil': async () => await sendPersonalInfo(userId, senderId),
    'informacion_beneficios': async () => await sendBenefitsInfo(userId, senderId),
    'informacion_comunidad': async () => await sendCommunityInfo(userId, senderId),
    'constancia_miembro': async () => await sendConstanciaInfo(userId, senderId),
  };

  const actionToExecute = actions[action];
  if (actionToExecute) {
    await actionToExecute(); // Ejecutar la acción correspondiente
  } else {
    console.log(`Acción no manejada: ${action}`);
  }
};

module.exports =  processApiAction ;
