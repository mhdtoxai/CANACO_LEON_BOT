const express = require('express');
const router = express.Router();
const { BackupNoMember } = require('../controllers/backupController'); // Importamos el controlador


router.post('/backup', BackupNoMember); 

module.exports = router;
