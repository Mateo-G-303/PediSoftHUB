const db = require('../models');
const Categoria = db.Categoria;
const Producto = db.Producto;

const obtenerMenuPorRestaurante = async (req, res) => {
    try {
        const { restaurante_id } = req.params;

        // Buscar todas las categorías de este restaurante
        const menu = await Categoria.findAll({
            where: { restaurante_id: restaurante_id },
            order: [
                ['orden', 'ASC'] // Ordenar las categorías según el campo "orden"
            ],
            include: [
                {
                    model: Producto,
                    where: { disponible: true }, // Solo traer productos disponibles
                    required: false // Hace un LEFT JOIN: trae la categoría incluso si no tiene productos activos
                }
            ]
        });

        if (!menu || menu.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un menú para este restaurante.' });
        }

        res.status(200).json(menu);

    } catch (error) {
        console.error('Error al obtener el menú:', error);
        res.status(500).json({ error: 'Error interno del servidor al cargar el menú.' });
    }
};

module.exports = {
    obtenerMenuPorRestaurante
};