const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuario = db.Usuario;
const Rol = db.Rol;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario y traer su rol asociado
        const usuario = await Usuario.findOne({ 
            where: { email: email, activo: true },
            include: [{ model: Rol, attributes: ['nombre'] }]
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Credenciales incorrectas o usuario inactivo.' });
        }

        // 2. Verificar la contraseña encriptada
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        // 3. Generar el JWT (El "gafete" virtual)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.Rol.nombre, 
                restaurante_id: usuario.restaurante_id 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token expira en 8 horas (un turno laboral)
        );

        res.status(200).json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.Rol.nombre
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { login };