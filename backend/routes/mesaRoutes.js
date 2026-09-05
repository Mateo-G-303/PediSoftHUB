const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// Protegemos todas las rutas de este archivo con verificarToken
router.use(verificarToken);

// CORRECCIÓN: Separamos el middleware del controlador con una coma y cerramos bien los paréntesis.
// Además cambiamos '/' por '/generar' en el POST para que coincida con React.
router.post('/generar', autorizarRoles(['RESTAURANT_ADMIN']), mesaController.generarMesas);
router.get('/', autorizarRoles(['RESTAURANT_ADMIN']), mesaController.obtenerMesas);

module.exports = router;