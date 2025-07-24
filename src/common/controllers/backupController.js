const userService = require('../services/userService'); // Usamos el servicio para obtener el usuario
const mongoose = require('mongoose');

// Controlador para la ruta de backup
const BackupNoMember = async (req, res) => {
    const { _id } = req.body; // Obtener el _id desde el cuerpo de la solicitud

    // Validar si se pasó el _id
    if (!_id) {
        return res.status(400).json({
            message: 'El campo _id es requerido en el cuerpo de la solicitud.',
        });
    }

    try {
        // Buscar el usuario en la colección de usuarios por _id usando el servicio
        const userDoc = await userService.getUser(_id);

        if (!userDoc) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
            });
        }

        // Convertir el documento a un objeto si no es un documento de Mongoose
        const userObject = userDoc.toObject ? userDoc.toObject() : userDoc;

        // Crear una copia del documento del usuario para el backup
        const backupData = { ...userObject, backupDate: new Date() }; // Añadimos la fecha del backup

        // Guardar en la colección de backups
        const backupResult = await mongoose.connection.collection('no_members_bk').insertOne(backupData);

        // Responder con el resultado del backup
        return res.status(200).json({
            message: 'Backup realizado con éxito',
            backupId: backupResult.insertedId, // Devolvemos el id del documento insertado
        });
    } catch (error) {
        console.error('Error al hacer backup del usuario:', error.message);
        return res.status(500).json({
            message: 'Error al realizar el backup',
            error: error.message, // Enviamos el mensaje de error
        });
    }
};

module.exports = { BackupNoMember };
