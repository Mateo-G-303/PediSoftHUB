const db = require('../models');
const CuentaMesa = db.CuentaMesa;
const Orden = db.Orden;
const DetalleOrden = db.DetalleOrden;
const Producto = db.Producto;

const crearOrden = async (req, res) => {
    // Iniciamos una transacción para asegurar que o se guarda TODO o no se guarda NADA
    const t = await db.sequelize.transaction();

    try {
        const { token_sesion, productos } = req.body;

        // 1. Validaciones básicas
        if (!token_sesion || !productos || productos.length === 0) {
            return res.status(400).json({ error: 'Faltan datos o el carrito está vacío.' });
        }

        // 2. Verificar que el token exista y la cuenta siga ABIERTA
        const cuenta = await CuentaMesa.findOne({
            where: { token_sesion: token_sesion, estado: 'ABIERTA' },
            include: [{ model: db.Mesa, attributes: ['restaurante_id'] }] // <-- Agregamos esto
        });

        if (!cuenta) {
            return res.status(401).json({ error: 'Sesión inválida, expirada o cuenta cerrada.' });
        }

        // 3. Crear el ticket (Orden principal)
        const nuevaOrden = await Orden.create({
            cuenta_mesa_id: cuenta.id,
            estado: 'PENDIENTE'
        }, { transaction: t });

        // 4. Armar el detalle de la orden buscando los precios reales
        const detallesData = [];

        for (let item of productos) {
            // BUSCAMOS EL PRECIO EN LA BDD, NO USAMOS EL DEL FRONTEND
            const productoDb = await Producto.findByPk(item.producto_id);

            if (!productoDb || !productoDb.disponible) {
                throw new Error(`El producto con ID ${item.producto_id} no existe o no está disponible.`);
            }

            detallesData.push({
                orden_id: nuevaOrden.id,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: productoDb.precio, // Guardamos el precio actual congelado
                notas_cocina: item.notas_cocina || null
            });
        }

        // 5. Insertar todos los detalles de golpe (BulkCreate)
        await DetalleOrden.bulkCreate(detallesData, { transaction: t });

        // 6. Si todo salió bien, confirmamos la transacción (Commit)
        await t.commit();

        // ==========================================
        // 🚀 LA MAGIA DEL TIEMPO REAL 🚀
        // ==========================================
        const io = req.app.get('socketio'); // Recuperamos la instancia de Socket.io
        const restauranteId = cuenta.Mesa.restaurante_id;
        const nombreSala = `cocina_restaurante_${restauranteId}`;

        // Disparamos el evento a todos los dispositivos en la cocina de este restaurante
        io.to(nombreSala).emit('nueva_orden_recibida', {
            mensaje: '¡Nueva orden detectada!',
            orden_id: nuevaOrden.id
            // En el futuro, aquí puedes enviar el JSON formateado de la orden completa 
            // para que React lo dibuje inmediatamente sin tener que volver a hacer un fetch.
        });

        res.status(201).json({
            mensaje: 'Orden enviada a cocina exitosamente',
            orden_id: nuevaOrden.id
        });

    } catch (error) {
        // Si algo falló (ej. un producto no existe), deshacemos todo lo que hicimos (Rollback)
        await t.rollback();
        console.error('Error al crear la orden:', error);

        // Enviamos el mensaje de error personalizado si lo lanzamos arriba
        res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
};

const obtenerOrdenesCocina = async (req, res) => {
    try {
        const { restaurante_id } = req.params;

        // Buscamos órdenes en estado PENDIENTE o EN_PREPARACION
        const ordenes = await Orden.findAll({
            where: {
                estado: ['PENDIENTE', 'EN_PREPARACION']
            },
            order: [
                ['created_at', 'ASC'] // Las órdenes más viejas primero (First In, First Out)
            ],
            include: [
                {
                    model: CuentaMesa, // Para saber de quién y de qué mesa es
                    required: true,
                    include: [
                        {
                            model: db.Mesa, // Para saber el número de mesa físico
                            where: { restaurante_id: restaurante_id },
                            required: true,
                            attributes: ['numero_mesa'] // Solo necesitamos el número, no el QR
                        }
                    ],
                    attributes: ['alias_comensal'] // Solo necesitamos el nombre del cliente
                },
                {
                    model: DetalleOrden, // Los productos de la orden
                    required: true,
                    attributes: ['cantidad', 'notas_cocina'],
                    include: [
                        {
                            model: Producto, // Para sacar el nombre del producto
                            attributes: ['nombre']
                        }
                    ]
                }
            ]
        });

        // Opcional: Formatear la respuesta para que el frontend la consuma más fácil
        // Si no hacemos esto, Sequelize devuelve todo muy anidado
        const ordenesFormateadas = ordenes.map(orden => ({
            orden_id: orden.id,
            estado: orden.estado,
            hora_pedido: orden.created_at,
            mesa: orden.CuentaMesa.Mesa.numero_mesa,
            cliente: orden.CuentaMesa.alias_comensal,
            platillos: orden.DetalleOrdens.map(detalle => ({
                producto: detalle.Producto.nombre,
                cantidad: detalle.cantidad,
                notas: detalle.notas_cocina
            }))
        }));

        res.status(200).json(ordenesFormateadas);

    } catch (error) {
        console.error('Error al obtener órdenes para cocina:', error);
        res.status(500).json({ error: 'Error al cargar el panel de cocina.' });
    }
};

const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nuevo_estado } = req.body; 

        const estadosValidos = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];
        if (!estadosValidos.includes(nuevo_estado)) {
            return res.status(400).json({ error: 'Estado no válido.' });
        }

        // 1. Buscar la orden e incluir las relaciones para saber a qué restaurante pertenece
        const orden = await Orden.findByPk(id, {
            include: [
                {
                    model: db.CuentaMesa,
                    include: [
                        {
                            model: db.Mesa,
                            attributes: ['numero_mesa', 'restaurante_id']
                        }
                    ]
                }
            ]
        });

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }

        // 2. Actualizar el estado en la base de datos
        await orden.update({ estado: nuevo_estado });

        // ==========================================
        // 🔔 NOTIFICACIÓN EN TIEMPO REAL AL MESERO 🔔
        // ==========================================
        if (nuevo_estado === 'LISTO') {
            const io = req.app.get('socketio');
            const restauranteId = orden.CuentaMesa.Mesa.restaurante_id;
            const numeroMesa = orden.CuentaMesa.Mesa.numero_mesa;
            const salaMeseros = `meseros_restaurante_${restauranteId}`;

            // Emitimos el evento solo a los meseros de este restaurante
            io.to(salaMeseros).emit('plato_listo_para_entrega', {
                mensaje: `🔔 ¡El pedido de la Mesa ${numeroMesa} está listo en cocina!`,
                orden_id: orden.id,
                mesa: numeroMesa,
                alias_comensal: orden.CuentaMesa.alias_comensal
            });
        }

        res.status(200).json({
            mensaje: `El ticket #${id} ahora está en estado: ${nuevo_estado}`,
            orden_id: orden.id,
            estado: orden.estado
        });

    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        res.status(500).json({ error: 'Error interno al actualizar la orden.' });
    }
};

module.exports = {
    crearOrden, obtenerOrdenesCocina, actualizarEstadoOrden
};