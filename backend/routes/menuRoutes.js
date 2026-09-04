const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// 1. IMPORTAR EL GUARDIA DE SEGURIDAD
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta: GET /api/menu/:restaurante_id
router.get('/:restaurante_id', menuController.obtenerMenuPorRestaurante);

// NUEVA RUTA PROTEGIDA: Solo administradores con un token válido pueden entrar
router.post('/producto', verificarToken, menuController.crearProducto);

// NUEVAS RUTAS:
// Editar un producto por su ID
router.put('/producto/:id', verificarToken, menuController.actualizarProducto);

// Eliminar (Borrado Lógico) un producto por su ID
router.delete('/producto/:id', verificarToken, menuController.eliminarProducto);

module.exports = router;