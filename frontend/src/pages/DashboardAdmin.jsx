import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const DashboardAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estado unificado para el formulario
    const estadoInicialForm = { nombre: '', descripcion: '', precio: '', categoria_id: 1 };
    const [formulario, setFormulario] = useState(estadoInicialForm);
    const [productoEditando, setProductoEditando] = useState(null);

    const navigate = useNavigate();
    const restauranteId = 1; // Para pruebas locales

    const cargarMenu = async () => {
        try {
            // Reutilizamos el endpoint público, pero ahora el admin ve todo
            const respuesta = await api.get(`/menu/${restauranteId}`);
            // Aplanamos las categorías para tener una lista simple de productos
            const todosLosProductos = respuesta.data.flatMap(cat => cat.Productos || []);
            setProductos(todosLosProductos);
        } catch (error) {
            console.error("Error al cargar menú", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarMenu();
    }, []);

    // Maneja tanto la creación como la actualización
    const guardarProducto = async (e) => {
        e.preventDefault();
        try {
            if (productoEditando) {
                // Modo Edición (PUT)
                await api.put(`/menu/producto/${productoEditando}`, formulario);
                alert('✅ Producto actualizado');
            } else {
                // Modo Creación (POST)
                await api.post('/menu/producto', formulario);
                alert('✅ Producto creado');
            }
            
            setFormulario(estadoInicialForm);
            setProductoEditando(null);
            cargarMenu();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al procesar la solicitud.");
        }
    };

    const prepararEdicion = (producto) => {
        setFormulario({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            categoria_id: producto.categoria_id || 1
        });
        setProductoEditando(producto.id);
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este producto del menú?')) return;
        
        try {
            await api.delete(`/menu/producto/${id}`);
            alert('🗑️ Producto eliminado (Borrado lógico)');
            cargarMenu();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token_admin');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            
            {/* PANEL LATERAL - FORMULARIO */}
            <aside className="w-full md:w-1/3 bg-white p-8 shadow-xl z-10 flex flex-col">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Mi Restaurante</h1>
                        <span className="text-orange-500 font-bold text-sm">Panel de Administración</span>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-700 mb-4">
                    {productoEditando ? '✏️ Editar Producto' : '🍔 Nuevo Producto'}
                </h2>
                
                <form onSubmit={guardarProducto} className="space-y-4 flex-1">
                    <input 
                        type="text" required placeholder="Nombre (ej. Hamburguesa Simple)"
                        value={formulario.nombre} 
                        onChange={e => setFormulario({...formulario, nombre: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" 
                    />
                    <textarea 
                        required placeholder="Descripción de los ingredientes..."
                        value={formulario.descripcion} 
                        onChange={e => setFormulario({...formulario, descripcion: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg resize-none h-24" 
                    />
                    <div className="flex gap-2">
                        <input 
                            type="number" step="0.01" required placeholder="Precio ($)"
                            value={formulario.precio} 
                            onChange={e => setFormulario({...formulario, precio: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" 
                        />
                        <input 
                            type="number" required placeholder="ID Categoría"
                            value={formulario.categoria_id} 
                            onChange={e => setFormulario({...formulario, categoria_id: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg" 
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="flex-1 bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600">
                            {productoEditando ? 'Actualizar' : 'Guardar'}
                        </button>
                        {productoEditando && (
                            <button 
                                type="button" 
                                onClick={() => { setFormulario(estadoInicialForm); setProductoEditando(null); }}
                                className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <button onClick={cerrarSesion} className="mt-8 text-red-500 font-bold py-2 rounded-lg hover:bg-red-50 border border-transparent">
                    🚪 Cerrar Sesión
                </button>
            </aside>

            {/* PANEL PRINCIPAL - LISTA DE PRODUCTOS */}
            <main className="w-full md:w-2/3 p-8 flex-1 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Catálogo Activo</h2>
                
                {cargando ? <p>Cargando menú...</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {productos.map(prod => (
                            <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800">{prod.nombre}</h3>
                                    <p className="text-orange-600 font-bold">${parseFloat(prod.precio).toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => prepararEdicion(prod)} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-200">
                                        Editar
                                    </button>
                                    <button onClick={() => eliminarProducto(prod.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-200">
                                        Borrar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardAdmin;