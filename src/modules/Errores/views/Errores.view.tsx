import React, { useState } from 'react';
import { 
  Table, Card, Typography, Space, Tag, Input, Radio, 
  Button, Modal, Descriptions, Row, Col, Tooltip 
} from 'antd';
import { 
  BugOutlined, ReloadOutlined, SearchOutlined, EyeOutlined,
  DesktopOutlined, ApiOutlined 
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { getErrores, type ErrorLogItem } from '../services/errores.service';

const { Title, Text, Paragraph } = Typography;

export const ErroresView: React.FC = () => {
  const [filtroSistema, setFiltroSistema] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [errorSeleccionado, setErrorSeleccionado] = useState<ErrorLogItem | null>(null);

  const { data: errores = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['errores', filtroSistema],
    queryFn: () => getErrores(filtroSistema),
    refetchInterval: 15000, // Refresca automáticamente cada 15 segundos
  });

  const totalFrontend = errores.filter(e => e.tipoSistema?.toLowerCase() === 'frontend').length;
  const totalBackend = errores.filter(e => e.tipoSistema?.toLowerCase() === 'backend').length;

  const erroresFiltrados = errores.filter((e) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      e.ruta?.toLowerCase().includes(term) ||
      e.detalle?.toLowerCase().includes(term) ||
      e.codigoEstado?.toString().includes(term) ||
      e.metodo?.toLowerCase().includes(term)
    );
  });

  const getTagEstado = (codigo: number) => {
    if (codigo === 404) return <Tag color="orange">404 NOT FOUND</Tag>;
    if (codigo >= 500) return <Tag color="red">{codigo} ERROR</Tag>;
    if (codigo >= 400) return <Tag color="warning">{codigo} BAD REQ</Tag>;
    return <Tag color="default">{codigo || 0}</Tag>;
  };

  const columns: ColumnsType<ErrorLogItem> = [
    {
      title: 'Fecha y Hora',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (ts: string) => (
        <Text style={{ fontSize: 13 }}>
          {new Date(ts).toLocaleString('es-AR')}
        </Text>
      ),
    },
    {
      title: 'Sistema',
      dataIndex: 'tipoSistema',
      key: 'tipoSistema',
      width: 130,
      render: (sistema: string) => {
        const esFront = sistema?.toLowerCase() === 'frontend';
        return (
          <Tag 
            color={esFront ? 'cyan' : 'purple'} 
            icon={esFront ? <DesktopOutlined /> : <ApiOutlined />}
            style={{ fontWeight: 600, padding: '2px 8px' }}
          >
            {sistema ? sistema.toUpperCase() : 'DESCONOCIDO'}
          </Tag>
        );
      },
    },
    {
      title: 'Código',
      dataIndex: 'codigoEstado',
      key: 'codigoEstado',
      width: 130,
      render: (codigo: number) => getTagEstado(Number(codigo)),
    },
    {
      title: 'Método',
      dataIndex: 'metodo',
      key: 'metodo',
      width: 100,
      render: (metodo: string) => (
        <Tag style={{ fontWeight: 600 }}>{metodo || 'GET'}</Tag>
      ),
    },
    {
      title: 'Ruta / Endpoint',
      dataIndex: 'ruta',
      key: 'ruta',
      width: 220,
      render: (ruta: string) => (
        <Tooltip title={ruta}>
          <Text code style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ruta || '/'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Detalle del Error',
      dataIndex: 'detalle',
      key: 'detalle',
      render: (detalle: string) => (
        <Paragraph 
          ellipsis={{ rows: 2, tooltip: detalle }} 
          style={{ marginBottom: 0, fontSize: 13, color: '#595959' }}
        >
          {detalle}
        </Paragraph>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setErrorSeleccionado(record)}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1250, margin: '0 auto' }}>
      {/* Tarjeta de Encabezado */}
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center">
              <BugOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>Registro y Auditoría de Errores</Title>
                <Text type="secondary">
                  Monitoreo unificado de incidencias y excepciones capturadas en Firestore (Frontend y Backend)
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Actualizar Logs
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Contenido Principal */}
      <Card>
        {/* Barra de Filtros */}
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col>
            <Space size="middle" wrap>
              <Text strong>Filtrar por origen:</Text>
              <Radio.Group 
                value={filtroSistema} 
                onChange={(e) => setFiltroSistema(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="TODOS">
                  Todos ({errores.length})
                </Radio.Button>
                <Radio.Button value="Frontend">
                  <DesktopOutlined style={{ marginRight: 4 }} />
                  Frontend ({filtroSistema === 'TODOS' ? totalFrontend : errores.length})
                </Radio.Button>
                <Radio.Button value="Backend">
                  <ApiOutlined style={{ marginRight: 4 }} />
                  Backend ({filtroSistema === 'TODOS' ? totalBackend : errores.length})
                </Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          <Col>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Buscar por ruta, código o detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              allowClear
              style={{ width: 320 }}
            />
          </Col>
        </Row>

        {/* Tabla de Errores */}
        <Table
          columns={columns}
          dataSource={erroresFiltrados}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 12, showSizeChanger: true }}
          bordered
        />
      </Card>

      {/* Modal de Detalle de Error */}
      <Modal
        title={
          <Space>
            <BugOutlined style={{ color: '#ff4d4f' }} />
            <span>Detalle de Incidencia #{errorSeleccionado?.id}</span>
          </Space>
        }
        open={!!errorSeleccionado}
        onCancel={() => setErrorSeleccionado(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setErrorSeleccionado(null)}>
            Cerrar
          </Button>
        ]}
        width={750}
      >
        {errorSeleccionado && (
          <div style={{ marginTop: 12 }}>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Sistema">
                <Tag color={errorSeleccionado.tipoSistema?.toLowerCase() === 'frontend' ? 'cyan' : 'purple'}>
                  {errorSeleccionado.tipoSistema}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Código de Estado">
                {getTagEstado(Number(errorSeleccionado.codigoEstado))}
              </Descriptions.Item>
              <Descriptions.Item label="Método HTTP">
                <Tag>{errorSeleccionado.metodo}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha y Hora">
                {new Date(errorSeleccionado.timestamp).toLocaleString('es-AR')}
              </Descriptions.Item>
              <Descriptions.Item label="Ruta afectada" span={2}>
                <Text code copyable>{errorSeleccionado.ruta}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Detalle y Trazabilidad del Error:
            </Text>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: 14,
                borderRadius: 6,
                fontSize: 12,
                maxHeight: 320,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {errorSeleccionado.detalle}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

