const messageService = require('../services/messageService');

exports.handleIncomingMessage = async (req, res) => {
  // Enviar respuesta HTTP 200 inmediatamente
  res.sendStatus(200);

  // Procesar el mensaje
  try {
    await messageService.processMessage(req.body);
  } catch (error) {
    console.error('Error al procesar el mensaje:', error);
    // No enviar res.sendStatus(400) aquí, ya hemos respondido con 200 OK
  }
};
exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("¡Webhook verificado correctamente!");
  } else {
    res.sendStatus(403);
  }
};


// const messageService = require('../services/messageService');

// exports.handleIncomingMessage = async (req, res) => {
//   console.log("Mensaje entrante del webhook:", JSON.stringify(req.body, null, 2));
//   res.sendStatus(200); 
//   await messageService.processMessage(req.body);
// };

// exports.verifyWebhook = (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
//     res.status(200).send(challenge);
//     console.log("¡Webhook verificado correctamente!");
//   } else {
//     res.sendStatus(403);
//   }
// };

