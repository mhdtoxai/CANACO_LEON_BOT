const db = require('../database/mongoConfig');

// ID de organización obtenido desde variable de entorno
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;

exports.getUser = async (wa_id) => {
    return await db.collection("users").findOne({
        wa_id,
        organization_id: ORGANIZATION_ID
    });
};

exports.createUser = async (wa_id) => {
    return await db.collection("users").insertOne({
        wa_id,
        organization_id: ORGANIZATION_ID,
        state: 'bienvenida'
    });
};

exports.updateUser = async (wa_id, data) => {
    return await db.collection("users").updateOne(
        { wa_id, organization_id: ORGANIZATION_ID },
        { $set: data }
    );
}; 