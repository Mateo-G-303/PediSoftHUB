const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenController');

// Ruta: POST /api/ordenes
router.post('/', ordenController.crearOrden);
router.get('/cocina/:restaurante_id', ordenController.obtenerOrdenesCocina);
router.patch('/:id/estado', ordenController.actualizarEstadoOrden);

module.exports = router;