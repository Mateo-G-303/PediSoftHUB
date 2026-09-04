const db = require('../models');
const Restaurante = db.Restaurante;

// ==========================================
// CREAR UN NUEVO RESTAURANTE (SUPERADMIN)
// ==========================================
const crearRestaurante = async (req, res) => {
    try {
        const { nombre, direccion, telefono, ruc } = req.body;

        // Generador automático de slug (minúsculas, sin espacios, sin caracteres raros)
        const slugGenerado = nombre
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-');

        const nuevoRestaurante = await Restaurante.create({
            nombre,
            slug: slugGenerado, // Lo inyectamos aquí
            direccion,
            telefono,
            ruc,
            activo: true
        });

        res.status(201).json({
            mensaje: '🏢 Nuevo restaurante registrado en PediSoft con éxito.',
            restaurante: nuevoRestaurante
        });

    } catch (error) {
        console.error('Error al crear el restaurante:', error);
        res.status(500).json({ error: 'Error interno al registrar el restaurante.' });
    }
};

// ==========================================
// OBTENER TODOS LOS RESTAURANTES (SUPERADMIN)
// ==========================================
const obtenerRestaurantes = async (req, res) => {
    try {
        const restaurantes = await Restaurante.findAll();
        res.status(200).json(restaurantes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la lista de restaurantes.' });
    }
};

module.exports = {
    crearRestaurante,
    obtenerRestaurantes
};