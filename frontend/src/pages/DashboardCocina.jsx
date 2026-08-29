import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const DashboardCocina = () => {
    const [ordenes, setOrdenes] = useState([]);
    const restauranteId = 1; // Lo dejamos fijo para las pruebas

    useEffect(() => {
        // 1. Función para cargar el historial de órdenes pendientes
        const cargarOrdenes = async () => {
            try {
                const respuesta = await api.get(`/ordenes/cocina/${restauranteId}`);
                setOrdenes(respuesta.data);
            } catch (error) {
                console.error("Error al cargar órdenes:", error);
            }
        };

        // Cargamos al iniciar la pantalla
        cargarOrdenes();

        // 2. Conectar a los WebSockets (Socket.io)
        const socket = io('http://localhost:3000'); // La URL de tu backend en Node

        socket.on('connect', () => {
            console.log('🟢 Cocina conectada al servidor en tiempo real');
            socket.emit('unirse_cocina', restauranteId); // Nos unimos a la sala de este restaurante
        });

        // 3. Escuchar cuando entra un nuevo pedido
        socket.on('nueva_orden_recibida', (datos) => {
            console.log("¡BIP! Nueva orden recibida:", datos);
            // Cuando llega una orden, volvemos a consultar la base de datos para pintar la tarjeta
            // (Si quisieras optimizar al máximo, el backend podría enviar la orden completa en el JSON del socket)
            cargarOrdenes(); 
        });

        // Limpieza: Desconectamos el socket si el cocinero cierra esta pantalla
        return () => socket.disconnect();
    }, []);

    // Función para el botón "Marcar como Listo"
    const marcarComoListo = async (ordenId) => {
        try {
            await api.patch(`/ordenes/${ordenId}/estado`, {
                nuevo_estado: 'LISTO'
            });
            // Filtramos la orden localmente para que desaparezca al instante de la pantalla
            setOrdenes(ordenesActuales => ordenesActuales.filter(orden => orden.orden_id !== ordenId));
        } catch (error) {
            console.error("Error al actualizar la orden:", error);
            alert("No se pudo actualizar el estado.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 p-6">
            <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">👨‍🍳 Panel de Cocina</h1>
                <div className="flex items-center gap-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-semibold tracking-wider">EN LÍNEA</span>
                </div>
            </header>

            {/* Cuadrícula de Tickets */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ordenes.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 mt-20 text-2xl font-semibold">
                        No hay pedidos pendientes. ¡Buen trabajo! ☕
                    </div>
                ) : (
                    ordenes.map((orden) => (
                        <div key={orden.orden_id} className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full border-t-8 border-orange-500 transform transition duration-300 hover:scale-[1.02]">
                            
                            {/* Cabecera del Ticket */}
                            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800">Mesa {orden.mesa}</h2>
                                    <p className="text-gray-500 text-sm font-medium">{orden.cliente}</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                        {orden.estado}
                                    </span>
                                    <p className="text-gray-400 text-xs mt-2">
                                        {new Date(orden.hora_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Platillos */}
                            <div className="p-5 flex-1 bg-yellow-50">
                                <ul className="space-y-4">
                                    {orden.platillos.map((item, index) => (
                                        <li key={index} className="border-b border-yellow-200 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-start">
                                                <span className="bg-orange-500 text-white font-bold w-8 h-8 flex items-center justify-center rounded-lg mr-3 shadow-md shrink-0">
                                                    {item.cantidad}
                                                </span>
                                                <div className="pt-1">
                                                    <span className="text-lg font-bold text-gray-800">{item.producto}</span>
                                                    {item.notas && (
                                                        <p className="text-red-500 font-semibold text-sm mt-1 bg-red-50 p-2 rounded border border-red-100 italic">
                                                            ⚠️ Nota: {item.notas}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Botón de Acción */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <button 
                                    onClick={() => marcarComoListo(orden.orden_id)}
                                    className="w-full bg-green-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors active:scale-95"
                                >
                                    ¡Plato Listo! ✔️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default DashboardCocina;