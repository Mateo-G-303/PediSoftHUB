import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api', // La URL de tu backend en Node
});

export const obtenerMenu = async (restauranteId) => {
    const respuesta = await api.get(`/menu/${restauranteId}`);
    return respuesta.data;
};

// NUEVO: Interceptor para inyectar el token en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token_admin');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
