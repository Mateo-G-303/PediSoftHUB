const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// Protegemos todas las rutas de este archivo con verificarToken
router.use(verificarToken);

// Solo el rol "Superadmin" puede acceder a estas rutas
router.post('/', autorizarRoles(['SUPER_ADMIN']), restauranteController.crearRestaurante);
router.get('/', autorizarRoles(['SUPER_ADMIN']), restauranteController.obtenerRestaurantes);

module.exports = router;