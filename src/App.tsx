import { Routes, Route, Navigate } from 'react-router-dom';
import { MarcaView } from './modules/Marca/views/Marca.view';
import { MainLayout } from './layouts/MainLayout';
import { CategoriaView } from './modules/Categoria/views/Categoria.view';
import { ProductoView } from './modules/Productos/views/Producto.view';
import { SucursalView } from './modules/Sucursales/views/Sucursal.view';
import { UsuarioView } from './modules/Usuarios/views/Usuario.view';
import { StockView } from './modules/Stock/views/stock.view'
import { PresupuestoView } from './modules/Presupuesto/view/presupuesto.view';
import { ClienteView } from './modules/Cliente/views/Cliente.view';
import { DepositoView } from './modules/Deposito/views/Deposito.view';
import { ProveedoresView } from './modules/Proveedores/views/Proveedores.view';
import { NuevaVenta } from './modules/Ventas/views/NuevaVenta';
import { HistorialVentas } from './modules/Ventas/views/HistorialVentas';
import { FinanciacionView } from './modules/Financiacion/views/Financiacion.view';
import { DashboardView } from './modules/Dashboard/views/Dashboard.view';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardView />} />

        {/* --- PERSONAS --- */}
        <Route path="clientes" element={<ClienteView />} />
        <Route path="usuarios" element={<UsuarioView />} />
        <Route path="proveedores" element={<ProveedoresView />} />

        {/* --- CATÁLOGO E INVENTARIO --- */}
        <Route path="productos" element={<ProductoView />} />
        <Route path="categorias" element={<CategoriaView />} />
        <Route path="marcas" element={<MarcaView />} />
        <Route path="stock" element={<StockView />} />
        <Route path="depositos" element={<DepositoView />} />

        {/* --- COMERCIAL (Ventas y Presupuestos) --- */}
        <Route path="presupuestos" element={<PresupuestoView />} />
        <Route path="ventas" element={<Navigate to="/ventas/historial" replace />} />
        <Route path="ventas/nueva" element={<NuevaVenta />} />
        <Route path="ventas/historial" element={<HistorialVentas />} />

        {/* --- ADMINISTRACIÓN --- */}
        <Route path="sucursales" element={<SucursalView />} />

        <Route path="/financiacion" element={<FinanciacionView />} />

        {/* 404 */}
        <Route path="*" element={<h2>Error 404: Página no encontrada</h2>} />
      </Route>
    </Routes>
  );
}

export default App;

