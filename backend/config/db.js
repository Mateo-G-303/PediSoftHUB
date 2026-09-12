// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASS,
//     {
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         dialect: 'postgres',
//         logging: false, // Ponlo en true si quieres ver las consultas SQL en consola
//     }
// );

// module.exports = sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Obligatorio para que Supabase acepte la conexión
        }
    }
});

module.exports = sequelize;