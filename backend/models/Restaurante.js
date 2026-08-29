const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Restaurante = sequelize.define('Restaurante', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'restaurantes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Restaurante;