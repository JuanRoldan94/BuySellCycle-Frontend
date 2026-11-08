import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  TagsOutlined,
  PartitionOutlined,
  UserOutlined,
  ShopOutlined,
  RetweetOutlined,
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  CreditCardOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const rootSubmenukeys = ['personas', 'catalogo', 'comercial', 'administracion'];

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    {
      key: 'personas',
      icon: <TeamOutlined />,
      label: 'Personas',
      children: [
        { key: '/clientes', icon: <UserOutlined />, label: 'Clientes' },
        { key: '/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
        { key: '/proveedores', icon: <UserOutlined />, label: 'Proveedores' },
      ],
    },
    {
      key: 'catalogo',
      icon: <AppstoreOutlined />,
      label: 'Catálogo e Inventario',
      children: [
        { key: '/productos', icon: <TagsOutlined />, label: 'Productos' },
        { key: '/categorias', icon: <PartitionOutlined />, label: 'Categorías' },
        { key: '/marcas', icon: <TagsOutlined />, label: 'Marcas' },
        { key: '/stock', icon: <RetweetOutlined />, label: 'Movimientos Stock' },
        { key: '/depositos', icon: <ShopOutlined />, label: 'Depósitos' },
      ],
    },
    {
      key: 'comercial',
      icon: <ShoppingCartOutlined />,
      label: 'Comercial',
      children: [
        { key: '/ventas', icon: <ShopOutlined />, label: 'Ventas' },
        { key: '/ventas/nueva', icon: < ShopOutlined />, label: 'Nueva Venta' },
        { key: '/presupuestos', icon: <FileTextOutlined />, label: 'Presupuestos' },
      ],
    },
    {
      key: 'administracion',
      icon: <SettingOutlined />,
      label: 'Administración',
      children: [
        { key: '/sucursales', icon: <ShopOutlined />, label: 'Sucursales' },
      ],
    },
    { key: '/financiacion', icon: <CreditCardOutlined />, label: 'Financiacion' },
  ];

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    if (latestOpenKey && rootSubmenukeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          onClick={({ key }) => {
            if (!key.startsWith('/')) return;
            navigate(key);
          }}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <h2 style={{ margin: '0 16px' }}>BuySellCycle Admin</h2>
        </Header>

        <Content style={{ margin: '16px 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};