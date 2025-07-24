const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Ruta para recibir mensajes de WhatsApp Business API
router.post('/', messageController.handleIncomingMessage);

// Ruta para la verificación del webhook
router.get('/', messageController.verifyWebhook);




module.exports = router;
