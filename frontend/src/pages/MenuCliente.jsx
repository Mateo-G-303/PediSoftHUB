import { useState, useEffect } from 'react';
import { api, obtenerMenu } from '../services/api';

const MenuCliente = () => {
    const [menu, setMenu] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [carrito, setCarrito] = useState([]);
    
    // NUEVO: Estado para controlar si el modal está abierto o cerrado
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    
    //const restauranteId = 1;
    const restauranteId = localStorage.getItem('restaurante_id');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const datos = await obtenerMenu(restauranteId);
                setMenu(datos);
            } catch (error) {
                console.error("Error al cargar el menú", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const agregarAlCarrito = (producto) => {
        setCarrito((carritoActual) => {
            const productoExistente = carritoActual.find(item => item.producto_id === producto.id);
            if (productoExistente) {
                return carritoActual.map(item =>
                    item.producto_id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            } else {
                return [...carritoActual, {
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    precio: parseFloat(producto.precio),
                    cantidad: 1,
                    notas_cocina: "" 
                }];
            }
        });
    };

    // NUEVO: Función para actualizar las notas de un producto específico
    const actualizarNota = (productoId, textoNota) => {
        setCarrito(carrito.map(item => 
            item.producto_id === productoId 
                ? { ...item, notas_cocina: textoNota } 
                : item
        ));
    };

    // NUEVO: Función para enviar el pedido al backend
    const confirmarPedido = async () => {
        try {
            // RECUPERAMOS EL TOKEN REAL DEL STORAGE
            const tokenReal = localStorage.getItem('token_sesion'); 
            
            if (!tokenReal) {
                alert("Error de sesión: Por favor escanea el QR nuevamente.");
                return;
            }

            await api.post('/ordenes', {
                token_sesion: tokenReal,
                productos: carrito
            });

            alert("¡Orden enviada a la cocina exitosamente! 🍳");
            setCarrito([]); 
            setMostrarCarrito(false); 
            
        } catch (error) {
            console.error("Error al enviar pedido:", error);
            alert("Hubo un error al enviar tu orden. Intenta nuevamente.");
        }
    };

    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

    if (cargando) return <div className="text-center p-10 text-xl font-bold text-gray-600">Cargando menú...</div>;

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 relative">
            <header className="bg-orange-500 text-white p-4 sticky top-0 shadow-md z-10">
                <h1 className="text-2xl font-bold text-center">Nuestro Menú</h1>
            </header>

            <main className="p-4">
                {menu.map((categoria) => (
                    <div key={categoria.id} className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-1">
                            {categoria.nombre}
                        </h2>
                        
                        <div className="flex flex-col gap-4">
                            {categoria.Productos.map((producto) => (
                                <div key={producto.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="pr-4 flex-1">
                                        <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                                        <p className="text-sm text-gray-500 my-1">{producto.descripcion}</p>
                                        <span className="font-bold text-orange-600">${parseFloat(producto.precio).toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={() => agregarAlCarrito(producto)}
                                        className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-bold text-xl hover:bg-orange-500 hover:text-white transition-colors active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>

            {/* BARRA FLOTANTE */}
            {totalItems > 0 && !mostrarCarrito && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
                    <div className="max-w-md mx-auto">
                        <button 
                            onClick={() => setMostrarCarrito(true)}
                            className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl flex justify-between items-center shadow-lg hover:bg-orange-600 transition-colors active:scale-95"
                        >
                            <span className="bg-orange-600 px-3 py-1 rounded-lg text-sm">{totalItems}</span>
                            <span>Ver Carrito</span>
                            <span>${totalPrecio.toFixed(2)}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* NUEVO: MODAL DEL CARRITO */}
            {mostrarCarrito && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end justify-center sm:items-center">
                    <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up sm:animate-none">
                        
                        {/* Cabecera del Modal */}
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Tu Pedido</h2>
                            <button 
                                onClick={() => setMostrarCarrito(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Lista de Productos en el Carrito */}
                        <div className="p-5 overflow-y-auto flex-1">
                            {carrito.map((item) => (
                                <div key={item.producto_id} className="mb-6 border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-gray-800">
                                            <span className="text-orange-500 mr-2">{item.cantidad}x</span>
                                            {item.nombre}
                                        </div>
                                        <div className="font-bold text-gray-600">
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </div>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Notas (ej. sin cebolla, extra salsa...)"
                                        value={item.notas_cocina}
                                        onChange={(e) => actualizarNota(item.producto_id, e.target.value)}
                                        className="w-full text-sm mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Footer del Modal con botón de envío */}
                        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                            <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-800">
                                <span>Total a pagar:</span>
                                <span>${totalPrecio.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={confirmarPedido}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-600 transition-colors active:scale-95"
                            >
                                Enviar a Cocina
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuCliente;