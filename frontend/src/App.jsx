import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuCliente from "./pages/MenuCliente";
import Bienvenida from "./pages/Bienvenida";
import DashboardCocina from "./pages/DashboardCocina"; // <-- Importamos

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla inicial para escanear/ingresar a la mesa */}
        <Route path="/" element={<Bienvenida />} />

        {/* Pantalla del menú */}
        <Route path="/menu" element={<MenuCliente />} />

        {/* Nueva ruta para el monitor de la cocina */}
        <Route path="/cocina" element={<DashboardCocina />} />
        
        {/* Si escriben una ruta que no existe, los mandamos al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
