const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // El token suele enviarse en los headers como: "Bearer <token>"
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Si el token es válido, extraemos los datos (id, rol, restaurante_id)
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Inyectamos los datos del usuario en la petición para que los siguientes controladores los usen
        req.usuario = decodificado; 
        
        next(); // Le decimos a Express: "Todo en orden, déjalo pasar a la ruta"
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// NUEVO MIDDLEWARE: Verifica si el rol del usuario está en la lista permitida
const autorizarRoles = (rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario viene del middleware verificarToken previo
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` 
            });
        }
        next();
    };
};

module.exports = { verificarToken, autorizarRoles };