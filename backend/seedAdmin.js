const bcrypt = require('bcryptjs');
const db = require('./models');

const crearAdmin = async () => {
    try {
        // Conectar a la base de datos
        await db.sequelize.authenticate();
        console.log('Conexión establecida para el script de sembrado...');

        // 1. Asegurarnos de que el Rol exista
        const [rolAdmin] = await db.Rol.findOrCreate({
            where: { nombre: 'MESERO' },
            defaults: { descripcion: 'Acceso total al sistema PediSoft' }
        });

        // 2. Encriptar la contraseña 'admin123'
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        // 3. Crear tu usuario como Super Administrador
        const [usuario, creado] = await db.Usuario.findOrCreate({
            where: { email: 'erick@gmail.com' },
            defaults: {
                nombre: 'Erick Flores',
                password_hash: passwordHash,
                activo: true,
                rol_id: rolAdmin.id,
                restaurante_id: 1 // Asumimos que el restaurante de prueba es el ID 1
            }
        });

        if (creado) {
            console.log('\n✅ Usuario ', usuario.nombre, ' creado con éxito en PostgreSQL.');
            console.log('--------------------------------------------------');
            console.log('📧 Email: ', usuario.email);
            console.log('🔑 Password: ', 'admin123');
            console.log('--------------------------------------------------\n');
        } else {
            console.log('\n⚠️ El usuario ', usuario.email, ' ya existe en la base de datos.\n');
        }

    } catch (error) {
        console.error('❌ Error al crear el usuario:', error);
    } finally {
        // Cerramos la conexión para que el script termine en la terminal
        await db.sequelize.close();
    }
};

crearAdmin();