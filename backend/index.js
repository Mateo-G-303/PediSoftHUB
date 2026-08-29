// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const sequelize = require('./config/db');

// // Importar la base de datos con todas sus relaciones ya configuradas
// const db = require('./models'); 
// // db.Restaurante, db.Mesa, db.Producto ya están listos para usarse

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json()); // Para que Express entienda JSON

// // ==========================================
// // IMPORTAR Y USAR RUTAS AQUÍ
// // ==========================================
// const menuRoutes = require('./routes/menuRoutes');
// const sesionRoutes = require('./routes/sesionRoutes');
// const ordenRoutes = require('./routes/ordenRoutes');

// app.use('/api/ordenes', ordenRoutes);
// app.use('/api/sesion', sesionRoutes);
// app.use('/api/menu', menuRoutes);

// // Ruta de prueba
// app.get('/api/ping', (req, res) => {
//     res.json({ mensaje: 'El backend de PediSoft está vivo 🚀' });
// });

// // Configurar puerto
// const PORT = process.env.PORT || 3000;

// // Levantar servidor y conectar BD
// app.listen(PORT, async () => {
//     console.log(`Servidor corriendo en el puerto ${PORT}`);
//     try {
//         await sequelize.authenticate();
//         console.log('✅ Conexión a la base de datos establecida con éxito.');
        
//         // Opcional: sequelize.sync() crea las tablas si no existen.
//         // Como ya las creaste en SQL, no es estrictamente necesario, pero es útil.
//         // await sequelize.sync({ alter: true }); 
//     } catch (error) {
//         console.error('❌ Error al conectar con la base de datos:', error);
//     }
// });

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./models');

// 1. Importar librerías nativas para Sockets
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// 2. Envolver Express en un servidor HTTP
const server = http.createServer(app);

// 3. Inicializar Socket.io con permisos de CORS (para que React se pueda conectar)
const io = new Server(server, {
    cors: {
        origin: "*", // En producción, aquí va la URL de tu frontend (ej: https://pedisoft.app)
        methods: ["GET", "POST", "PATCH"]
    }
});

// 4. Hacer que 'io' sea accesible desde cualquier controlador
app.set('socketio', io);

// ==========================================
// LÓGICA DE WEBSOCKETS (TIEMPO REAL)
// ==========================================
io.on('connection', (socket) => {
    console.log(`🟢 Nuevo cliente conectado: ${socket.id}`);

    // --- SALA DE LA COCINA ---
    // Cuando el dashboard de la cocina se abre, le dice al backend a qué restaurante pertenece
    socket.on('unirse_cocina', (restaurante_id) => {
        const nombreSala = `cocina_restaurante_${restaurante_id}`;
        socket.join(nombreSala);
        console.log(`👨‍🍳 Cocina unida a la sala: ${nombreSala}`);
    });

    // --- SALA DE LOS MESEROS (NUEVO) ---
    socket.on('unirse_meseros', (restaurante_id) => {
        const nombreSala = `meseros_restaurante_${restaurante_id}`;
        socket.join(nombreSala);
        console.log(`🏃‍♂️ Mesero unido a: ${nombreSala}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
});

// ==========================================
// MIDDLEWARES Y RUTAS
// ==========================================
app.use(cors());
app.use(express.json());

const menuRoutes = require('./routes/menuRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const ordenRoutes = require('./routes/ordenRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/sesion', sesionRoutes);
app.use('/api/ordenes', ordenRoutes);

// ==========================================
// LEVANTAR EL SERVIDOR (OJO: Ahora usamos server.listen, no app.listen)
// ==========================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
    console.log(`Servidor HTTP y WebSockets corriendo en el puerto ${PORT}`);
    try {
        await db.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida con éxito.');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
});