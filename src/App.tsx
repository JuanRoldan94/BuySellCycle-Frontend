import { Routes, Route } from 'react-router-dom';
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

const DashboardMock = () => <h2>Bienvenido al Dashboard</h2>;

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardMock />} />
        <Route path="clientes" element={<ClienteView />} />
        <Route path="marcas" element={<MarcaView />} />
        <Route path="productos" element={<ProductoView />} />
        <Route path="stock" element={<StockView />} />
        <Route path="categorias" element={<CategoriaView />} />
        <Route path="sucursales" element={<SucursalView />} />
        <Route path="usuarios" element={<UsuarioView />} />
        <Route path="presupuestos" element={<PresupuestoView />} />
        <Route path="depositos" element={<DepositoView />} />
        <Route path="*" element={<h2>Error 404: Página no encontrada</h2>} />
      </Route>
    </Routes>
  );
}

export default App;

