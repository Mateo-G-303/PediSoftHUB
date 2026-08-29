const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Mesa = sequelize.define('Mesa', {
    numero_mesa: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    qr_codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'LIBRE'
    }
}, {
    tableName: 'mesas',
    timestamps: false
});

module.exports = Mesa;  