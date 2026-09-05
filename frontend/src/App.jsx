import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuCliente from "./pages/MenuCliente";
import Bienvenida from "./pages/Bienvenida";
import DashboardCocina from "./pages/DashboardCocina";
import DashboardMesero from "./pages/DashboardMesero";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardSuperAdmin from "./pages/DashboardSuperAdmin"; // Corregido el nombre si aplica
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vistas del Cliente */}
        <Route path="/" element={<Bienvenida />} />
        
        {/* NUEVA RUTA: Atrapa el código QR desde la URL */}
        <Route path="/mesa/:token" element={<Bienvenida />} /> 
        
        <Route path="/menu" element={<MenuCliente />} />

        {/* Vistas del Personal */}
        <Route path="/login" element={<Login />} />
        <Route path="/cocina" element={<DashboardCocina />} />
        <Route path="/mesero" element={<DashboardMesero />} />

        {/* Vistas Administrativas */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/superadmin" element={<DashboardSuperAdmin />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;