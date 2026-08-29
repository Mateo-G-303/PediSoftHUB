import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const DashboardMesero = () => {
    // Estado para guardar las notificaciones que llegan de la cocina
    const [notificaciones, setNotificaciones] = useState([]);
    
    // Estado temporal para probar el cobro de una cuenta específica
    const [cuentaIdCobrar, setCuentaIdCobrar] = useState('');
    
    const restauranteId = 1; // Fijo para las pruebas locales

    useEffect(() => {
        // Conectamos el Socket
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('🏃‍♂️ Mesero conectado al servidor en tiempo real');
            socket.emit('unirse_meseros', restauranteId); 
        });

        // Escuchamos el evento que emite la cocina al marcar "LISTO"
        socket.on('plato_listo_para_entrega', (datos) => {
            console.log("¡Notificación de cocina!", datos);
            
            // Agregamos la nueva alerta al principio de la lista
            setNotificaciones(prev => [{
                id: Date.now(), // Un ID único para la vista de React
                mensaje: datos.mensaje,
                mesa: datos.mesa,
                cliente: datos.alias_comensal,
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, ...prev]);
        });

        // Escuchamos actualizaciones generales de mesas (si otra tablet cobra una cuenta)
        socket.on('mesa_actualizada', (datos) => {
            console.log("Actualización de mesa:", datos);
            // En un mapa visual completo, aquí cambiaríamos la mesa de rojo a verde
        });

        return () => socket.disconnect();
    }, []);

    // Función para descartar la notificación una vez que el mesero entrega el plato
    const marcarComoEntregado = (notificacionId) => {
        setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
    };

    // Función para probar nuestro endpoint de pago
    const procesarPago = async (e) => {
        e.preventDefault();
        if (!cuentaIdCobrar) return;

        try {
            const respuesta = await api.patch(`/sesion/${cuentaIdCobrar}/pagar`);
            alert(`✅ ${respuesta.data.mensaje}\nEstado de la mesa: ${respuesta.data.mesa_liberada ? 'LIBERADA (Verde)' : 'AÚN OCUPADA (Roja)'}`);
            setCuentaIdCobrar('');
        } catch (error) {
            console.error("Error al cobrar:", error);
            alert(error.response?.data?.error || "Error al procesar el pago.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <header className="bg-blue-600 text-white p-5 shadow-md flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold">Zafarrancho (Mesero)</h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-200"></span>
                    </span>
                    <span className="text-sm font-semibold">Conectado</span>
                </div>
            </header>

            <main className="p-4 max-w-md mx-auto">
                
                {/* Zona de Notificaciones (Alertas de Cocina) */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        🔔 Pedidos Listos en Cocina
                        {notificaciones.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notificaciones.length}</span>
                        )}
                    </h2>
                    
                    <div className="space-y-4">
                        {notificaciones.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                Sin notificaciones por ahora.
                            </p>
                        ) : (
                            notificaciones.map(notif => (
                                <div key={notif.id} className="bg-white border-l-8 border-green-500 rounded-xl shadow-lg p-4 animate-slide-up flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Mesa {notif.mesa}</h3>
                                            <p className="text-gray-600 font-medium">Cliente: {notif.cliente}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 font-bold">{notif.hora}</span>
                                    </div>
                                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                                        {notif.mensaje}
                                    </p>
                                    <button 
                                        onClick={() => marcarComoEntregado(notif.id)}
                                        className="mt-2 w-full bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        Marcar como Entregado a la mesa
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-300" />

                {/* Zona Temporal para probar el Cierre de Cuenta */}
                <section className="bg-white p-5 rounded-2xl shadow-md border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">💳 Cobrar Cuenta (Prueba)</h2>
                    <p className="text-sm text-gray-500 mb-4">Ingresa el ID de la cuenta que deseas cobrar y liberar.</p>
                    
                    <form onSubmit={procesarPago} className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="ID Cuenta (ej: 1)"
                            value={cuentaIdCobrar}
                            onChange={(e) => setCuentaIdCobrar(e.target.value)}
                            required
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors active:scale-95"
                        >
                            Cobrar
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default DashboardMesero;