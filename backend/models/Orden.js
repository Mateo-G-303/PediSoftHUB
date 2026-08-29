const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Orden = sequelize.define('Orden', {
    estado: {
        type: DataTypes.STRING(30),
        defaultValue: 'PENDIENTE' // 'PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'
    }
}, {
    tableName: 'ordenes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Orden; 