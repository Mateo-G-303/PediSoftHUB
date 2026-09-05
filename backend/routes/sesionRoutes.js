const express = require('express');
const router = express.Router();
const sesionController = require('../controllers/sesionController');

// Ruta: POST /api/sesion/iniciar
router.post('/iniciar', sesionController.iniciarSesionMesa);
router.patch('/:id/pagar', sesionController.cerrarCuentaMesa);

router.get('/validar-mesa/:token', sesionController.validarMesa);

module.exports = router;