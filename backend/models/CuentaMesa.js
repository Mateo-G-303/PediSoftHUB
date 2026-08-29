const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CuentaMesa = sequelize.define('CuentaMesa', {
    alias_comensal: {
        type: DataTypes.STRING(50) // Ej: "Juan" o "Invitado 1"
    },
    token_sesion: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'ABIERTA' // 'ABIERTA' o 'PAGADA'
    }
}, {
    tableName: 'cuentas_mesa',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // En SQL no definimos updated_at
});

module.exports = CuentaMesa;