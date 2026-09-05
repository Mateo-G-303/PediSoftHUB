const crypto = require('crypto');
const db = require('../models');
const Mesa = db.Mesa;

const generarMesas = async (req, res) => {
    try {
        const { cantidad } = req.body;
        const restauranteId = req.usuario.restaurante_id;

        if (req.usuario.rol !== 'Administrador' && req.usuario.rol !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({ error: 'No tienes permisos para configurar mesas.' });
        }

        // Borrar mesas anteriores del restaurante (opcional, para resetear)
        await Mesa.destroy({ where: { restaurante_id: restauranteId } });

        const nuevasMesas = [];
        for (let i = 1; i <= cantidad; i++) {
            // Genera un token único y seguro: ej. "rest1-mesa5-8f3a2b"
            const tokenUnico = `rest${restauranteId}-mesa${i}-${crypto.randomBytes(4).toString('hex')}`;
            
            nuevasMesas.push({
                numero_mesa: i,
                qr_codigo: tokenUnico,
                estado: 'LIBRE',
                restaurante_id: restauranteId
            });
        }

        await Mesa.bulkCreate(nuevasMesas);

        res.status(201).json({
            mensaje: `Se generaron ${cantidad} mesas correctamente.`,
            mesas: nuevasMesas
        });

    } catch (error) {
        console.error('Error al generar mesas:', error);
        res.status(500).json({ error: 'Error interno al generar los QRs.' });
    }
};

const obtenerMesas = async (req, res) => {
    try {
        const restauranteId = req.usuario.restaurante_id;
        
        const mesas = await Mesa.findAll({
            where: { restaurante_id: restauranteId },
            order: [['numero_mesa', 'ASC']]
        });

        res.status(200).json(mesas);
    } catch (error) {
        console.error('Error al obtener mesas:', error);
        res.status(500).json({ error: 'Error al cargar las mesas.' });
    }
};

module.exports = {
    generarMesas,
    obtenerMesas
};