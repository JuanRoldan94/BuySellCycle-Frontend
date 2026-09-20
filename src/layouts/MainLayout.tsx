import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  AppstoreOutlined,
  TagsOutlined,
  PartitionOutlined,
  UserOutlined,
  ShopOutlined,
  RetweetOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/marcas', icon: <TagsOutlined />, label: 'Marcas' },
    { key: '/productos', icon: <TagsOutlined />, label: 'Productos' },
    { key: '/stock', icon: <RetweetOutlined />, label: 'Movimientos Stock' },
    { key: '/presupuestos', icon: <FileTextOutlined />, label: 'Presupuestos' },
    { key: '/clientes', icon: <UserOutlined />, label: 'Clientes' },
    { key: '/sucursales', icon: <ShopOutlined />, label: 'Sucursales' },
    { key: '/categorias', icon: <PartitionOutlined />, label: 'Categorías' },
    { key: '/usuarios', icon: <UserOutlined />, label: 'Usuarios' }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          mode="inline"

          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
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