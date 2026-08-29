const sequelize = require('../config/db');

// 1. Importar todos los modelos
const Restaurante = require('./Restaurante');
const Mesa = require('./Mesa');
// (Asumiendo que crearás estos archivos con la misma estructura)
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const CuentaMesa = require('./CuentaMesa');
const Orden = require('./Orden');
const DetalleOrden = require('./DetalleOrden');
const Usuario = require('./Usuario');
const Rol = require('./Rol');

// ==========================================
// 2. DEFINIR LAS RELACIONES (ASOCIACIONES)
// ==========================================

// --- Relaciones de Restaurante ---
// Un restaurante tiene muchas mesas / Una mesa pertenece a un restaurante
Restaurante.hasMany(Mesa, { foreignKey: 'restaurante_id' });
Mesa.belongsTo(Restaurante, { foreignKey: 'restaurante_id' });

// Un restaurante tiene muchas categorías
Restaurante.hasMany(Categoria, { foreignKey: 'restaurante_id' });
Categoria.belongsTo(Restaurante, { foreignKey: 'restaurante_id' });

// Un restaurante tiene muchos productos
Restaurante.hasMany(Producto, { foreignKey: 'restaurante_id' });
Producto.belongsTo(Restaurante, { foreignKey: 'restaurante_id' });

// --- Relaciones del Menú ---
// Una categoría tiene muchos productos / Un producto pertenece a una categoría
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// --- Relaciones Operativas (El flujo del cliente) ---
// Una mesa puede tener varias cuentas (Enfoque 1: varias personas pidiendo por separado)
Mesa.hasMany(CuentaMesa, { foreignKey: 'mesa_id' });
CuentaMesa.belongsTo(Mesa, { foreignKey: 'mesa_id' });

// Una cuenta de mesa puede tener varias órdenes (Tickets a cocina)
CuentaMesa.hasMany(Orden, { foreignKey: 'cuenta_mesa_id' });
Orden.belongsTo(CuentaMesa, { foreignKey: 'cuenta_mesa_id' });

// Una orden tiene muchos detalles (los productos dentro del ticket)
Orden.hasMany(DetalleOrden, { foreignKey: 'orden_id' });
DetalleOrden.belongsTo(Orden, { foreignKey: 'orden_id' });

// Un producto puede estar en muchos detalles de orden
Producto.hasMany(DetalleOrden, { foreignKey: 'producto_id' });
DetalleOrden.belongsTo(Producto, { foreignKey: 'producto_id' });

// --- Relaciones de Usuarios y Roles ---
// Un rol tiene muchos usuarios / Un usuario pertenece a un rol
Rol.hasMany(Usuario, { foreignKey: 'rol_id' });
Usuario.belongsTo(Rol, { foreignKey: 'rol_id' });

// Un restaurante tiene muchos usuarios (empleados) / Un usuario pertenece a un restaurante
// Nota: El SUPER_ADMIN tendrá restaurante_id en null
Restaurante.hasMany(Usuario, { foreignKey: 'restaurante_id' });
Usuario.belongsTo(Restaurante, { foreignKey: 'restaurante_id' });

// 3. Exportar todo empaquetado
module.exports = {
    sequelize,
    Restaurante,
    Mesa,
    Categoria,
    Producto,
    CuentaMesa,
    Orden,
    DetalleOrden,
    Usuario,
    Rol
};