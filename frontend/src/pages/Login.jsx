import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const respuesta = await api.post('/auth/login', { email, password });
            
            // 1. Guardamos el token en el almacenamiento local
            localStorage.setItem('token_admin', respuesta.data.token);
            
            // 2. Extraemos el rol que nos devuelve tu backend
            const rolUsuario = respuesta.data.usuario.rol;

            // 3. Redirigimos al dashboard correcto según el rol
            switch (rolUsuario) {
                case 'SUPER_ADMIN':
                    navigate('/superadmin');
                    break;
                case 'RESTAURANT_ADMIN':
                    navigate('/admin');
                    break;
                case 'COCINERO':
                    navigate('/cocina');
                    break;
                case 'MESERO':
                    navigate('/mesero');
                    break;
                default:
                    setError('Rol no reconocido por el sistema.');
            }
            
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Error al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">PediSoft</h1>
                    <p className="text-gray-500 mt-2 font-medium">Acceso para Personal y Administradores</p>
                </div>

                <form onSubmit={iniciarSesion} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="ejemplo@restaurante.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={cargando}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors active:scale-95 disabled:bg-blue-300"
                    >
                        {cargando ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;