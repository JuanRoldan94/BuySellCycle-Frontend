import React, { useState } from 'react';
import { Card, Row, Col, Select, Form, InputNumber, Button, Table, Typography, Space, message, Divider } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';

import { getProductos } from '../../Productos/services/producto.service';
import { getClientes } from '../../Cliente/services/cliente.service';
import { createPresupuesto } from '../services/presupuesto.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface ItemCarrito {
  productoId: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export const PresupuestoView: React.FC = () => {
  const [formAdd] = Form.useForm();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const { data: productos, isLoading: loadingProd } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
  const { data: clientes, isLoading: loadingCli } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });

  const presupuestoMutation = useMutation({
    mutationFn: createPresupuesto,
    onSuccess: () => {
      message.success('Presupuesto generado con éxito');
      setCarrito([]);
      setClienteId(null);
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Error al generar presupuesto')
  });

  const handleAgregarAlCarrito = (values: { productoId: number; cantidad: number }) => {
    const productoDb = productos?.find((p: any) => p.id === values.productoId);
    if (!productoDb) return;

    setCarrito((prev) => {
      const existe = prev.find((item) => item.productoId === values.productoId);

      if (existe) {
        return prev.map((item) =>
          item.productoId === values.productoId
            ? {
              ...item,
              cantidad: item.cantidad + values.cantidad,
              subtotal: (item.cantidad + values.cantidad) * Number(productoDb.precioLista)
            }
            : item
        );
      } else {
        return [...prev, {
          productoId: productoDb.id,
          codigo: productoDb.codigo,
          nombre: productoDb.nombre,
          cantidad: values.cantidad,
          precioUnitario: productoDb.precioLista,
          subtotal: values.cantidad * Number(productoDb.precioLista)
        }];
      }
    });

    formAdd.resetFields();
  };

  const handleEliminarItem = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const handleGenerarPresupuesto = () => {
    if (!clienteId) return message.warning('Debe seleccionar un cliente');
    if (carrito.length === 0) return message.warning('El presupuesto no tiene productos');

    const payload = {
      clienteId,
      sucursalId: 1,
      items: carrito.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }))
    };

    presupuestoMutation.mutate(payload);
  };

  const totalPresupuesto = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const formatearDinero = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

  const columnasCarrito = [
    { title: 'Código', dataIndex: 'codigo', key: 'codigo', width: 100 },
    { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'center' as const },
    { title: 'Precio U.', dataIndex: 'precioUnitario', key: 'precioUnitario', align: 'right' as const, render: (m: number) => formatearDinero(m) },
    { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', align: 'right' as const, render: (m: number) => <strong>{formatearDinero(m)}</strong> },
    {
      title: '',
      key: 'accion',
      width: 60,
      render: (_: any, record: ItemCarrito) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleEliminarItem(record.productoId)} />
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}><ShoppingCartOutlined /> Nuevo Presupuesto</Title>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card title="1. Datos Generales" size="small" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Cliente:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Seleccione un cliente"
                loading={loadingCli}
                showSearch
                optionFilterProp="children"
                value={clienteId}
                onChange={setClienteId}
              >
                {clientes?.map((c: any) => <Option key={c.id} value={c.id}>{c.nombre} {c.apellido}</Option>)}
              </Select>
            </div>
          </Card>

          <Card title="2. Agregar Producto" size="small">
            <Form form={formAdd} layout="vertical" onFinish={handleAgregarAlCarrito}>
              <Form.Item name="productoId" label="Buscar Producto" rules={[{ required: true, message: 'Requerido' }]}>
                <Select showSearch optionFilterProp="children" loading={loadingProd} placeholder="Tipee para buscar...">
                  {productos?.map((p: any) => <Option key={p.id} value={p.id}>[{p.codigo}] {p.nombre}</Option>)}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true, message: 'Requerido' }]} initialValue={1}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Form.Item style={{ width: '100%' }}>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                      Agregar
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Detalle del Presupuesto" size="small" styles={{ body: { padding: 0 } }}>
            <Table
              columns={columnasCarrito}
              dataSource={carrito}
              rowKey="productoId"
              pagination={false}
              locale={{ emptyText: 'No hay productos en el presupuesto' }}
            />

            <div style={{ padding: '24px', background: '#fafafa', textAlign: 'right' }}>
              <Title level={4} style={{ margin: 0 }}>
                Total: <span style={{ color: '#1890ff' }}>{formatearDinero(totalPresupuesto)}</span>
              </Title>
              <Divider style={{ margin: '16px 0' }} />
              <Space>
                <Button onClick={() => { setCarrito([]); setClienteId(null); }}>Cancelar</Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleGenerarPresupuesto}
                  loading={presupuestoMutation.isPending}
                  disabled={carrito.length === 0 || !clienteId}
                >
                  Guardar Presupuesto
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};