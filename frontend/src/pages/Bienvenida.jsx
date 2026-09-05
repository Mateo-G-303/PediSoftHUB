import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const Bienvenida = () => {
    const { token } = useParams(); // Atrapa el token de la URL (ej: rest1-mesa5-8f3a2b)

    const [alias, setAlias] = useState('');
    const [codigoQR, setCodigoQR] = useState(token || ''); 
    const [infoMesa, setInfoMesa] = useState(null); // Guardará los datos del restaurante
    
    const [cargando, setCargando] = useState(false);
    const [cargandoInfo, setCargandoInfo] = useState(!!token); // Si hay token, empieza cargando info
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    // 1. Efecto automático: Si entra por el QR, consultamos los datos de la mesa
    useEffect(() => {
        if (token) {
            const validarMesa = async () => {
                try {
                    // Consultamos a un endpoint (que armaremos en el backend) para ver de quién es este QR
                    const respuesta = await api.get(`/sesion/validar-mesa/${token}`);
                    setInfoMesa(respuesta.data);
                } catch (error) {
                    setError('El código de esta mesa es inválido o ha caducado.');
                } finally {
                    setCargandoInfo(false);
                }
            };
            validarMesa();
        }
    }, [token]);

    const ingresarAMesa = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const respuesta = await api.post('/sesion/iniciar', {
                qr_codigo: codigoQR,
                alias_comensal: alias
            });

            localStorage.setItem('token_sesion', respuesta.data.token_sesion);
            localStorage.setItem('restaurante_id', respuesta.data.restaurante_id);
            
            // Opcional: Guardamos esto para que la pantalla del menú sepa quién es y en qué mesa está
            localStorage.setItem('alias_comensal', alias);
            if (infoMesa) localStorage.setItem('numero_mesa', infoMesa.numero_mesa);

            navigate('/menu');
            
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión en la mesa.');
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
                
                {/* 2. UI DINÁMICA: Mostramos la info según lo que responda el backend */}
                {cargandoInfo ? (
                    <div className="animate-pulse space-y-3 mb-8">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                ) : infoMesa ? (
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-gray-800">{infoMesa.restaurante_nombre}</h1>
                        <p className="text-orange-600 font-bold mt-1 text-lg">📍 Mesa {infoMesa.numero_mesa}</p>
                    </div>
                ) : (
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-800 mb-2">PediSoft</h1>
                        <p className="text-gray-500">Ingresa el código de tu mesa</p>
                    </div>
                )}

                <form onSubmit={ingresarAMesa} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            placeholder="¿Cómo te llamas?"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 font-bold"
                        />
                    </div>

                    {/* Solo mostramos el input del código si NO vinieron desde un QR (URL sin token) */}
                    {!token && (
                        <div>
                            <input 
                                type="text" 
                                placeholder="Código de la mesa"
                                value={codigoQR}
                                onChange={(e) => setCodigoQR(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 font-medium text-sm"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                    )}

                    <button 
                        type="submit" 
                        disabled={cargando || (token && !infoMesa)} 
                        className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {cargando ? 'Conectando...' : 'Ver Menú y Ordenar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Bienvenida;