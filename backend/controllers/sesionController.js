const crypto = require('crypto');
const db = require('../models');
const Mesa = db.Mesa;
const CuentaMesa = db.CuentaMesa;
const Restaurante = db.Restaurante;

const iniciarSesionMesa = async (req, res) => {
    try {
        // El frontend nos envía el código que escaneó y el nombre que ingresó el cliente
        const { qr_codigo, alias_comensal } = req.body;

        if (!qr_codigo) {
            return res.status(400).json({ error: 'El código QR es obligatorio.' });
        }

        // 1. Buscar si el QR pertenece a una mesa real
        const mesa = await Mesa.findOne({ where: { qr_codigo: qr_codigo } });

        if (!mesa) {
            return res.status(404).json({ error: 'Código QR no válido o mesa no encontrada.' });
        }

        // 2. Generar el Token de Sesión único (ej: 'a1b2c3d4e5...')
        const token_sesion = crypto.randomBytes(24).toString('hex');

        // 3. Crear la cuenta (sesión) individual para este cliente
        const nuevaCuenta = await CuentaMesa.create({
            mesa_id: mesa.id,
            alias_comensal: alias_comensal || 'Invitado', // Si no pasa nombre, le ponemos 'Invitado'
            token_sesion: token_sesion,
            estado: 'ABIERTA'
        });

        // 4. Marcar la mesa física como OCUPADA (si es que estaba libre)
        if (mesa.estado === 'LIBRE') {
            await mesa.update({ estado: 'OCUPADA' });
        }

        // 5. Devolver al frontend toda la info que necesita para operar
        res.status(201).json({
            mensaje: 'Sesión iniciada con éxito',
            token_sesion: nuevaCuenta.token_sesion,
            cuenta_mesa_id: nuevaCuenta.id,
            restaurante_id: mesa.restaurante_id, // Vital para saber qué menú cargar
            numero_mesa: mesa.numero_mesa,
            alias: nuevaCuenta.alias_comensal
        });

    } catch (error) {
        console.error('Error al iniciar sesión de mesa:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ==========================================
// VALIDAR CÓDIGO QR ESCANEADO (PÚBLICO)
// ==========================================
const validarMesa = async (req, res) => {
    try {
        const { token } = req.params;

        // 1. Buscamos la mesa que coincida con el token exacto
        const mesa = await Mesa.findOne({ 
            where: { qr_codigo: token } 
        });

        if (!mesa) {
            return res.status(404).json({ error: 'El código de esta mesa es inválido o no existe.' });
        }

        // 2. Buscamos el nombre del restaurante dueño de esa mesa
        const restaurante = await Restaurante.findByPk(mesa.restaurante_id);

        if (!restaurante) {
            return res.status(404).json({ error: 'Restaurante no encontrado.' });
        }

        // 3. Le respondemos a React con los datos exactos que necesita
        res.status(200).json({
            restaurante_nombre: restaurante.nombre,
            numero_mesa: mesa.numero_mesa,
            restaurante_id: restaurante.id
        });

    } catch (error) {
        console.error('Error al validar la mesa:', error);
        res.status(500).json({ error: 'Error interno del servidor al validar el QR.' });
    }
};

const cerrarCuentaMesa = async (req, res) => {
    // Iniciamos transacción porque actualizaremos dos tablas: CuentaMesa y Mesa
    const t = await db.sequelize.transaction();

    try {
        const { id } = req.params; // ID de la CuentaMesa que se va a pagar

        // 1. Buscar la cuenta y traer la información de la mesa asociada
        const cuenta = await CuentaMesa.findByPk(id, {
            include: [{ model: db.Mesa }]
        });

        if (!cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada.' });
        }

        if (cuenta.estado === 'PAGADA') {
            return res.status(400).json({ error: 'Esta cuenta ya fue pagada anteriormente.' });
        }

        // 2. Marcar la cuenta individual como PAGADA
        await cuenta.update({ estado: 'PAGADA' }, { transaction: t });

        // 3. Verificar cuántas cuentas siguen ABIERTAS en esta misma mesa física
        const cuentasAbiertasRestantes = await CuentaMesa.count({
            where: {
                mesa_id: cuenta.mesa_id,
                estado: 'ABIERTA'
            },
            transaction: t
        });

        // 4. Lógica de liberación de mesa
        let mesaLiberada = false;
        if (cuentasAbiertasRestantes === 0) {
            // Si ya no queda nadie comiendo, liberamos el espacio físico
            await cuenta.Mesa.update({ estado: 'LIBRE' }, { transaction: t });
            mesaLiberada = true;
        }

        // 5. Confirmar transacción
        await t.commit();

        // ==========================================
        // 🔔 NOTIFICACIÓN EN TIEMPO REAL (Opcional pero recomendado) 🔔
        // ==========================================
        const io = req.app.get('socketio');
        if (io) {
            const salaMeseros = `meseros_restaurante_${cuenta.Mesa.restaurante_id}`;
            // Avisamos a todos los meseros para que su mapa de mesas se actualice en verde o rojo
            io.to(salaMeseros).emit('mesa_actualizada', {
                mensaje: `Cuenta de ${cuenta.alias_comensal} pagada.`,
                mesa_id: cuenta.mesa_id,
                estado_mesa: mesaLiberada ? 'LIBRE' : 'OCUPADA'
            });
        }

        res.status(200).json({
            mensaje: 'Cuenta cobrada y cerrada exitosamente.',
            alias_comensal: cuenta.alias_comensal,
            mesa_liberada: mesaLiberada
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al cerrar la cuenta de la mesa:', error);
        res.status(500).json({ error: 'Error interno al procesar el pago.' });
    }
};

module.exports = {
    iniciarSesionMesa,
    cerrarCuentaMesa,
    validarMesa
};