const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Ruta: GET /api/menu/:restaurante_id
router.get('/:restaurante_id', menuController.obtenerMenuPorRestaurante);

module.exports = router;