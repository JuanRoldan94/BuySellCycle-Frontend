import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Spin, Empty } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats } from '../services/dashboard.service';

const { Title, Text } = Typography;

const COLORES_ESTADO: Record<string, string> = {
  EN_PREPARACION: '#faad14',
  DISPONIBLE_PARA_RETIRAR: '#13c2c2',
  EN_CAMINO: '#1890ff',
  ENTREGADO: '#52c41a',
  CANCELADO: '#ff4d4f',
};

const COLORES_PIE = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

const tagEstado = (estado: string) => {
  const colores: Record<string, string> = {
    EN_PREPARACION: 'orange',
    DISPONIBLE_PARA_RETIRAR: 'cyan',
    EN_CAMINO: 'blue',
    ENTREGADO: 'green',
    CANCELADO: 'red',
  };
  return <Tag color={colores[estado] || 'default'}>{estado.replace(/_/g, ' ')}</Tag>;
};

export const DashboardView: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refresca cada 30s
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Cargando dashboard...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="No se pudieron cargar las estadísticas" />
      </div>
    );
  }

  const { resumen, ventasPorEstado, ventasPorMes, ventasPorModoPago, topProductos, ultimasVentas } = stats;

  const columnasUltimasVentas = [
    {
      title: 'Nro',
      dataIndex: 'id',
      width: 80,
      render: (id: number) => <Text strong style={{ color: '#1890ff' }}>V-{String(id).padStart(4, '0')}</Text>,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, r: any) => `${r.cliente?.nombre} ${r.cliente?.apellido}`,
    },
    {
      title: 'Sucursal',
      key: 'sucursal',
      render: (_: any, r: any) => r.sucursal?.nombre,
    },
    {
      title: 'Total',
      dataIndex: 'montoTotal',
      align: 'right' as const,
      render: (v: number) => <Text strong>${Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      render: (estado: string) => tagEstado(estado),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaCreacion',
      render: (f: string) => new Date(f).toLocaleDateString('es-AR'),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <RiseOutlined style={{ marginRight: 8 }} />
        Dashboard
      </Title>

      {/* ───── KPI Cards ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Ventas Realizadas"
              value={resumen.totalVentas}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Ingresos Totales"
              value={resumen.totalIngresos}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Clientes Registrados"
              value={resumen.totalClientes}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Productos Activos"
              value={resumen.totalProductos}
              prefix={<AppstoreOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ───── Gráficos ───── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Ventas por Mes */}
        <Col xs={24} lg={14}>
          <Card title="Ventas por Mes" size="small">
            {ventasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ventasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 'Ingresos']}
                  />
                  <Bar dataKey="total" fill="#1890ff" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Sin datos de ventas aún" />
            )}
          </Card>
        </Col>

        {/* Ventas por Estado */}
        <Col xs={24} lg={10}>
          <Card title="Ventas por Estado" size="small">
            {ventasPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ventasPorEstado}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ estado, cantidad }: any) => `${estado.replace(/_/g, ' ')} (${cantidad})`}
                    labelLine={true}
                  >
                    {ventasPorEstado.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORES_ESTADO[entry.estado] || COLORES_PIE[index % COLORES_PIE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Sin datos" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Top Productos */}
        <Col xs={24} lg={10}>
          <Card title="Top 5 Productos Más Vendidos" size="small">
            {topProductos.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProductos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#722ed1" radius={[0, 4, 4, 0]} name="Unidades vendidas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Sin datos" />
            )}
          </Card>
        </Col>

        {/* Modo de Pago */}
        <Col xs={24} lg={14}>
          <Card title="Ventas por Modo de Pago" size="small">
            {ventasPorModoPago.length > 0 ? (
              <Row gutter={16} align="middle" style={{ padding: '20px 0' }}>
                {ventasPorModoPago.map((mp: any, i: number) => (
                  <Col key={mp.modo} xs={24} sm={12} style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Statistic
                      title={mp.modo === 'CONTADO' ? '💵 Contado' : '💳 Financiado'}
                      value={mp.cantidad}
                      suffix="ventas"
                      valueStyle={{ color: i === 0 ? '#52c41a' : '#1890ff' }}
                    />
                    <Text type="secondary">
                      Total: ${mp.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </Text>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Sin datos" />
            )}
          </Card>
        </Col>
      </Row>

      {/* ───── Últimas Ventas ───── */}
      <Card title="Últimas Ventas" size="small">
        <Table
          columns={columnasUltimasVentas}
          dataSource={ultimasVentas}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
};

