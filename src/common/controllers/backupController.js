const userService = require('../services/userService');
const mongoose = require('mongoose');

// Controlador para hacer backup de un usuario por wa_id
const BackupNoMember = async (req, res) => {
    const { wa_id } = req.body; //  recibimos wa_id

    if (!wa_id) {
        return res.status(400).json({
            message: 'El campo wa_id es requerido en el cuerpo de la solicitud.',
        });
    }

    try {
        // Buscar el usuario usando wa_id (organization_id se usa internamente en userService)
        const userDoc = await userService.getUser(wa_id);

        if (!userDoc) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
            });
        }

        const userObject = userDoc.toObject ? userDoc.toObject() : userDoc;
        const backupData = { ...userObject, backupDate: new Date() };

        const backupResult = await mongoose
            .connection
            .collection('no_members_bk')
            .insertOne(backupData);

        return res.status(200).json({
            message: 'Backup realizado con éxito',
            backupId: backupResult.insertedId,
        });

    } catch (error) {
        console.error('Error al hacer backup del usuario:', error.message);
        return res.status(500).json({
            message: 'Error al realizar el backup',
            error: error.message,
        });
    }
};

module.exports = { BackupNoMember };
