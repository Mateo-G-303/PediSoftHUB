import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const DashboardSuperadmin = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. CORRECCIÓN: Agregamos los estados completos y quitamos 'slug'
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("token_admin");
    localStorage.removeItem("restaurante_id");
    navigate("/login");
  };

  const cargarRestaurantes = async () => {
    try {
      const respuesta = await api.get("/restaurantes");
      setRestaurantes(respuesta.data);
    } catch (error) {
      console.error("Error al cargar restaurantes", error);
      alert("No tienes permisos o tu sesión expiró.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  const registrarRestaurante = async (e) => {
    e.preventDefault();
    try {
      // 2. CORRECCIÓN: Enviamos todos los datos al backend (sin el slug)
      await api.post("/restaurantes", { nombre, ruc, direccion, telefono });
      alert("✅ Restaurante registrado con éxito");

      // Limpiamos el formulario
      setNombre("");
      setRuc("");
      setDireccion("");
      setTelefono("");

      // Recargamos la lista
      cargarRestaurantes();
    } catch (error) {
      console.error("Error al crear:", error);
      alert("Hubo un error al registrar el restaurante.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* PANEL LATERAL - FORMULARIO */}
      <aside className="w-full md:w-1/3 bg-white p-8 shadow-xl z-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">PediSoft</h1>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Portal Superadmin
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-6">Nuevo Cliente</h2>

        <form onSubmit={registrarRestaurante} className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Nombre Comercial</label>
            <input
              type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          
          {/* 3. CORRECCIÓN: Agregamos RUC, Dirección y Teléfono. Quitamos el input de Slug */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">RUC / Identificación</label>
            <input
              type="text" required value={ruc} onChange={(e) => setRuc(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Dirección Física</label>
            <input
              type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Teléfono</label>
            <input
              type="text" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg mt-6 shadow-md hover:bg-purple-700 transition-colors"
          >
            Registrar Restaurante
          </button>
        </form>

        <div className="mt-auto pt-8">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 px-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* PANEL PRINCIPAL - TABLA DE RESTAURANTES */}
      <main className="w-full md:w-2/3 p-8 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Restaurantes Activos</h2>

        {cargando ? (
          <p className="text-gray-500">Cargando base de datos...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">RUC</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurantes.map((rest) => (
                  <tr key={rest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{rest.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{rest.nombre}</div>
                      <div className="text-sm text-gray-500">{rest.direccion} - {rest.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rest.ruc}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rest.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {rest.activo ? "Operativo" : "Suspendido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardSuperadmin;