const db = require('../database/mongoConfig');

exports.getUser = async (senderId) => {
    return await db.collection("users").findOne({ _id: senderId });
};

exports.createUser = async (senderId) => {
    return await db.collection("users").insertOne({
        _id: senderId, 
        state: 'bienvenida' 
    });
};

exports.updateUser = async (senderId, data) => {
    return await db.collection("users").updateOne({ _id: senderId }, { $set: data });
};
