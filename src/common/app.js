const express = require('express');

const webhookRoutes = require('./routes/webhookRoutes');
// const webhookStripe  = require('./routes/webhookStripe');
const taskRoutes = require('./routes/taskRoutes');
const backupRoutes = require('./routes/backupRoutes');
const cors = require('cors');
const app = express();


// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());
// app.use('/backend/webhook', webhookStripe);

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/meta/webhook', webhookRoutes);
app.use('/api', taskRoutes);
app.use('/api', backupRoutes);
module.exports = app;

