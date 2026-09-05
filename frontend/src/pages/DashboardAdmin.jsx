import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import QRCode from "react-qr-code";

const DashboardAdmin = () => {
  const [vista, setVista] = useState("menu");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Asumimos que tu backend ya está leyendo el ID desde el token JWT
  // por lo que no hace falta enviarlo en la URL en las rutas protegidas
  const restauranteId = 1;

  // --- ESTADOS DEL MENÚ ---
  const [productos, setProductos] = useState([]);
  const estadoInicialForm = {
    nombre: "",
    descripcion: "",
    precio: "",
    categoria_id: 1,
  };
  const [formulario, setFormulario] = useState(estadoInicialForm);
  const [productoEditando, setProductoEditando] = useState(null);

  // --- NUEVOS ESTADOS DE LAS MESAS ---
  const [mesas, setMesas] = useState([]); // Aquí guardaremos las mesas de la BD
  const [cantidadMesas, setCantidadMesas] = useState(10);

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    cargarMenu();
    cargarMesas();
  }, []);

  const cargarMenu = async () => {
    try {
      const respuesta = await api.get(`/menu/${restauranteId}`);
      const todosLosProductos = respuesta.data.flatMap(
        (cat) => cat.Productos || [],
      );
      setProductos(todosLosProductos);
    } catch (error) {
      console.error("Error al cargar menú", error);
    } finally {
      setCargando(false);
    }
  };

  // NUEVO: Función para traer las mesas reales desde PostgreSQL
  const cargarMesas = async () => {
    try {
      const respuesta = await api.get("/mesas");
      setMesas(respuesta.data);
      if (respuesta.data.length > 0) {
        setCantidadMesas(respuesta.data.length);
      }
    } catch (error) {
      console.error("Error al cargar mesas", error);
    }
  };

  // NUEVO: Función para pedirle al backend que genere y guarde los QRs
  const generarQRs = async (e) => {
    e.preventDefault();

    const confirmar = window.confirm(
      "⚠️ ATENCIÓN: Generar nuevos códigos reemplazará los anteriores. Los QRs físicos que ya imprimiste dejarán de funcionar. ¿Deseas continuar?",
    );

    if (!confirmar) return;

    try {
      await api.post("/mesas/generar", { cantidad: cantidadMesas });
      alert(
        `✅ ${cantidadMesas} mesas generadas exitosamente con tokens seguros.`,
      );
      cargarMesas(); // Recargamos la lista para ver los nuevos QRs
    } catch (error) {
      console.error("Error al generar mesas:", error);
      alert("Hubo un error al generar los códigos.");
    }
  };

  // --- LÓGICA DEL MENÚ (CRUD) ---
  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (productoEditando) {
        await api.put(`/menu/producto/${productoEditando}`, formulario);
        alert("✅ Producto actualizado");
      } else {
        await api.post("/menu/producto", formulario);
        alert("✅ Producto creado");
      }
      setFormulario(estadoInicialForm);
      setProductoEditando(null);
      cargarMenu();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const prepararEdicion = (producto) => {
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria_id: producto.categoria_id || 1,
    });
    setProductoEditando(producto.id);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/menu/producto/${id}`);
      cargarMenu();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token_admin");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* PANEL LATERAL */}
      <aside className="w-full md:w-1/3 bg-white p-8 shadow-xl z-10 flex flex-col border-r border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-800">Mi Restaurante</h1>
          <span className="text-orange-500 font-bold text-sm">
            Panel de Administración
          </span>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner">
          <button
            onClick={() => setVista("menu")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${vista === "menu" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            🍔 Catálogo
          </button>
          <button
            onClick={() => setVista("mesas")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${vista === "mesas" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            🪑 Mesas y QR
          </button>
        </div>

        {vista === "menu" ? (
          <>
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              {productoEditando ? "✏️ Editar Producto" : "🍔 Nuevo Producto"}
            </h2>
            <form onSubmit={guardarProducto} className="space-y-4 flex-1">
              <input
                type="text"
                required
                placeholder="Nombre (ej. Hamburguesa Simple)"
                value={formulario.nombre}
                onChange={(e) =>
                  setFormulario({ ...formulario, nombre: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              />
              <textarea
                required
                placeholder="Descripción de los ingredientes..."
                value={formulario.descripcion}
                onChange={(e) =>
                  setFormulario({ ...formulario, descripcion: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg resize-none h-24"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Precio ($)"
                  value={formulario.precio}
                  onChange={(e) =>
                    setFormulario({ ...formulario, precio: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  required
                  placeholder="ID Cat"
                  value={formulario.categoria_id}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      categoria_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600 shadow-md"
                >
                  {productoEditando ? "Actualizar" : "Guardar"}
                </button>
                {productoEditando && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormulario(estadoInicialForm);
                      setProductoEditando(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-700 mb-2">
              Configuración de Mesas
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Define cuántas mesas físicas tiene tu restaurante. Esto invalidará
              los QRs impresos anteriormente.
            </p>

            <form onSubmit={generarQRs}>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                Cantidad de Mesas Activas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={cantidadMesas}
                onChange={(e) => setCantidadMesas(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-center focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-6 shadow-md hover:bg-orange-600 transition-colors"
              >
                Generar Códigos QR Reales
              </button>
            </form>
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 px-4 rounded-xl hover:bg-red-50 transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* PANEL PRINCIPAL */}
      <main className="w-full md:w-2/3 p-8 flex-1 overflow-y-auto">
        {vista === "menu" ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Catálogo Activo
            </h2>
            {cargando ? (
              <p>Cargando menú...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {productos.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">{prod.nombre}</h3>
                      <p className="text-orange-600 font-bold">
                        ${parseFloat(prod.precio).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => prepararEdicion(prod)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(prod.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-100"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Códigos QR para Imprimir
              </h2>
              {mesas.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-gray-700 hidden md:block"
                >
                  🖨️ Imprimir Hoja
                </button>
              )}
            </div>

            {mesas.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-medium">
                Aún no has configurado tus mesas. Ingresa la cantidad en el
                panel lateral.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-4">
                {/* NUEVO: Mapeamos el estado "mesas" proveniente de PostgreSQL */}
                {mesas.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                  >
                    <span className="text-orange-500 font-black text-xl mb-4">
                      Mesa {mesa.numero_mesa}
                    </span>

                    <div className="p-3 bg-white border-4 border-gray-800 rounded-xl mb-4">
                      <QRCode
                        value={`${window.location.origin}/mesa/${mesa.qr_codigo}`}
                        size={120}
                        level="H"
                      />
                    </div>

                    <span
                      className="text-xs text-gray-400 font-mono tracking-tighter truncate w-full"
                      title={mesa.qr_codigo}
                    >
                      {mesa.qr_codigo}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardAdmin;
