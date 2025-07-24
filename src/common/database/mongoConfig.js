
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI; // Leer la variable desde .env

mongoose.connect(MONGO_URI)
    .then(() => {
        const dbName = mongoose.connection.name;
        console.log(`✅ Conectado a MongoDB - Base de datos: ${dbName}`);
    })
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err);
    });

module.exports = mongoose.connection;