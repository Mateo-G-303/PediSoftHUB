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
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ruc: {
            type: DataTypes.STRING,
            allowNull: true
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

    // Opcional: Aquí irían las asociaciones si las tienes (ej. Restaurante.hasMany(Usuario))
    module.exports = Restaurante;