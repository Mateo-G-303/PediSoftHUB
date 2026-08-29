import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Bienvenida = () => {
    // Estados inicializados con los datos de prueba para agilizar el desarrollo
    const [alias, setAlias] = useState('Juan Pérez');
    const [codigoQR, setCodigoQR] = useState('qr_token_mesa_5');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const ingresarAMesa = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            // Llamamos al endpoint que armaste en el backend
            const respuesta = await api.post('/sesion/iniciar', {
                qr_codigo: codigoQR,
                alias_comensal: alias
            });

            // Guardamos el token y el restaurante en el almacenamiento del navegador
            localStorage.setItem('token_sesion', respuesta.data.token_sesion);
            localStorage.setItem('restaurante_id', respuesta.data.restaurante_id);

            // Redirigimos mágicamente a la pantalla del menú
            navigate('/menu');
            
        } catch (err) {
            console.error(err);
            setError('Código QR no válido o mesa no encontrada.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
                
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🍔</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-2">PediSoft</h1>
                <p className="text-gray-500 mb-8">Escanea el QR de tu mesa para ordenar</p>

                <form onSubmit={ingresarAMesa} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            placeholder="¿Cómo te llamas?"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-700 font-medium"
                        />
                    </div>

                    {/* En producción, este campo estaría oculto y se llenaría con la cámara */}
                    <div>
                        <input 
                            type="text" 
                            placeholder="Código de la mesa"
                            value={codigoQR}
                            onChange={(e) => setCodigoQR(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-700 font-medium text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-semibold">{error}</p>
                    )}

                    <button 
                        type="submit" 
                        disabled={cargando}
                        className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors active:scale-95 disabled:bg-orange-300"
                    >
                        {cargando ? 'Conectando...' : 'Ver Menú y Ordenar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Bienvenida;