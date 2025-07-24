const express = require('express');
const router = express.Router();
const runTask  = require('../controllers/taskController');


router.post('/runTask', runTask);

module.exports = router;


