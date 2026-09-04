const db = require('../models');
const Categoria = db.Categoria;
const Producto = db.Producto;

const crearProducto = async (req, res) => {
    try {
        // Recibimos los datos del nuevo platillo
        const { nombre, descripcion, precio, categoria_id, disponible } = req.body;

        // Opcional: Podrías validar que el usuario tenga el rol 'Administrador'
        if (req.usuario.rol !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({ error: 'No tienes permisos para crear productos.' });
        }

        // Creamos el producto en la base de datos
        const nuevoProducto = await Producto.create({
            restaurante_id: req.usuario.restaurante_id, // Asociamos el producto al restaurante del usuario
            nombre,
            descripcion,
            precio,
            categoria_id,
            // Si no nos envían 'disponible', asumimos que es true por defecto
            disponible: disponible !== undefined ? disponible : true
        });

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            producto: nuevoProducto
        });

    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ error: 'Error interno al guardar el producto.' });
    }
};

// ==========================================
// EDITAR PRODUCTO (PUT)
// ==========================================
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id, disponible } = req.body;

        if (req.usuario.rol !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({ error: 'No tienes permisos para editar productos.' });
        }

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Actualizamos solo los campos que vengan en el req.body
        await producto.update({
            nombre: nombre !== undefined ? nombre : producto.nombre,
            descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
            precio: precio !== undefined ? precio : producto.precio,
            categoria_id: categoria_id !== undefined ? categoria_id : producto.categoria_id,
            disponible: disponible !== undefined ? disponible : producto.disponible
        });

        res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            producto
        });

    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el producto.' });
    }
};

// ==========================================
// ELIMINAR PRODUCTO (BORRADO LÓGICO) (DELETE)
// ==========================================
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario.rol !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({ error: 'No tienes permisos para eliminar productos.' });
        }

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // BORRADO LÓGICO: Solo cambiamos la disponibilidad a false.
        // (El GET del menú cliente debe filtrar para traer solo los disponibles)
        await producto.update({ disponible: false });

        res.status(200).json({
            mensaje: 'Producto eliminado del menú (Borrado lógico exitoso).',
            producto_id: producto.id
        });

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error interno al eliminar el producto.' });
    }
};

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
    obtenerMenuPorRestaurante,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};