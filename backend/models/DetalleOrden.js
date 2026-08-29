const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleOrden = sequelize.define('DetalleOrden', {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    notas_cocina: {
        type: DataTypes.STRING(255) // Ej: "Sin mayonesa"
    }
}, {
    tableName: 'detalle_orden',
    timestamps: false
});

module.exports = DetalleOrden;