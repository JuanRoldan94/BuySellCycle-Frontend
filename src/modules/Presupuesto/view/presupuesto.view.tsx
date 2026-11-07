import React, { useState } from 'react';
import { Card, Row, Col, Select, Form, InputNumber, Button, Table, Typography, Space, message, Divider, Radio, Tag } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, FilePdfOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';

import { getProductos } from '../../Productos/services/producto.service';
import { getClientes } from '../../Cliente/services/cliente.service';
import { createPDF } from '../services/presupuesto.service';

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

const getPlanes = async () => {
  const res = await fetch('http://localhost:3000/planes');
  if (!res.ok) throw new Error('Error al cargar los planes');
  return res.json();
};

export const PresupuestoView: React.FC = () => {
  const [formAdd] = Form.useForm();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // Estados en cascada para el simulador de financiación
  const [modoPago, setModoPago] = useState<'CONTADO' | 'PLAN'>('CONTADO');
  const [tarjetaId, setTarjetaId] = useState<number | null>(null);
  const [bancoId, setBancoId] = useState<number | null>(null);
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState<number | null>(null);

  const { data: productos, isLoading: loadingProd } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
  const { data: clientes, isLoading: loadingCli } = useQuery({ queryKey: ['clientes'], queryFn: getClientes });
  const { data: planes = [], isLoading: loadingPlanes } = useQuery({ queryKey: ['planes'], queryFn: getPlanes });

  const planesTarjeta = planes.filter((p: any) => p.id !== 6 && !p.archivado);

  const tarjetasDisponibles = Array.from(
    new Map(
      planesTarjeta.filter((p: any) => p.tarjeta).map((p: any) => [p.tarjeta.id, p.tarjeta])
    ).values()
  ) as { id: number; nombre: string }[];

  const bancosDisponibles = Array.from(
    new Map(
      planesTarjeta.filter((p: any) => p.tarjeta?.id === tarjetaId && p.banco).map((p: any) => [p.banco.id, p.banco])
    ).values()
  ) as { id: number; nombre: string }[];

  const planesFiltrados = planesTarjeta.filter((p: any) => p.tarjeta?.id === tarjetaId && p.banco?.id === bancoId);
  const planActivo = planesTarjeta.find((p: any) => p.id === planSeleccionadoId);

  const limpiarFinanciacion = () => {
    setModoPago('CONTADO');
    setTarjetaId(null);
    setBancoId(null);
    setPlanSeleccionadoId(null);
  };

  const subtotalPresupuesto = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const tasaInteres = modoPago === 'PLAN' && planActivo ? Number(planActivo.tasaFinanciacion || 0) : 0;
  const recargoTarjeta = subtotalPresupuesto * (tasaInteres / 100);
  const totalPresupuesto = subtotalPresupuesto + recargoTarjeta;
  const cantidadCuotas = planActivo?.cuotas || planActivo?.cantidadCuotas || 1;
  const valorCuota = cantidadCuotas > 0 ? totalPresupuesto / cantidadCuotas : totalPresupuesto;

  // LÓGICA DE DESCARGA DIRECTA DEL PDF
  const pdfMutation = useMutation({
    mutationFn: createPDF,
    onSuccess: (data: any) => {
      // 1. Creamos un objeto URL en la memoria del navegador usando el Blob que mandó el backend
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      
      // 2. Creamos un link <a> invisible y lo hacemos "clickear" automáticamente
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'presupuesto-simulacion.pdf'); // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();
      
      // 3. Limpiamos todo
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('PDF descargado con éxito');
      setCarrito([]);
      setClienteId(null);
      limpiarFinanciacion();
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Error al generar el PDF')
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
        return [
          ...prev,
          {
            productoId: productoDb.id,
            codigo: productoDb.codigo || `#${productoDb.id}`,
            nombre: productoDb.nombre,
            cantidad: values.cantidad,
            precioUnitario: Number(productoDb.precioLista),
            subtotal: values.cantidad * Number(productoDb.precioLista)
          }
        ];
      }
    });
    formAdd.resetFields();
  };

  const handleEliminarItem = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const handleGenerarPDF = () => {
    if (!clienteId) return message.warning('Debe seleccionar un cliente');
    if (carrito.length === 0) return message.warning('El presupuesto no tiene productos');

    const payload = {
      clienteId,
      sucursalId: 1,
      modoPago,
      planId: modoPago === 'PLAN' ? planSeleccionadoId : null,
      subtotal: subtotalPresupuesto,
      tasaInteres,
      recargo: recargoTarjeta,
      total: totalPresupuesto,
      cuotas: modoPago === 'PLAN' ? cantidadCuotas : 1,
      valorCuota: modoPago === 'PLAN' ? valorCuota : totalPresupuesto,
      items: carrito.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal
      }))
    };

    pdfMutation.mutate(payload);
  };

  const formatearDinero = (monto: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(monto || 0));

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
      <Title level={3} style={{ marginBottom: 24 }}><ShoppingCartOutlined /> Simulación y Descarga de PDF</Title>

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

          <Card title="2. Agregar Producto" size="small" style={{ marginBottom: 16 }}>
            <Form form={formAdd} layout="vertical" onFinish={handleAgregarAlCarrito}>
              <Form.Item name="productoId" label="Buscar Producto" rules={[{ required: true, message: 'Requerido' }]}>
                <Select showSearch optionFilterProp="children" loading={loadingProd} placeholder="Tipee para buscar...">
                  {productos?.map((p: any) => <Option key={p.id} value={p.id}>{p.nombre}</Option>)}
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
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Agregar</Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title={<span><CreditCardOutlined /> 3. Simular Financiación</span>} size="small">
            <div style={{ marginBottom: modoPago === 'PLAN' ? 16 : 0 }}>
              <Radio.Group
                value={modoPago}
                onChange={(e) => {
                  setModoPago(e.target.value);
                  if (e.target.value === 'CONTADO') {
                    setTarjetaId(null);
                    setBancoId(null);
                    setPlanSeleccionadoId(null);
                  }
                }}
                buttonStyle="solid"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value="CONTADO" style={{ flex: 1, textAlign: 'center' }}>Sin Financiación</Radio.Button>
                <Radio.Button value="PLAN" style={{ flex: 1, textAlign: 'center' }}>Tarjeta / Plan</Radio.Button>
              </Radio.Group>
            </div>

            {modoPago === 'PLAN' && (
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 12 }}>
                  <Text style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Tarjeta</Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="1. Seleccione Tarjeta..."
                    loading={loadingPlanes}
                    value={tarjetaId}
                    onChange={(val) => {
                      setTarjetaId(val);
                      setBancoId(null);
                      setPlanSeleccionadoId(null);
                    }}
                  >
                    {tarjetasDisponibles.map((t) => <Option key={t.id} value={t.id}>{t.nombre}</Option>)}
                  </Select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Text style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Banco</Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="2. Seleccione Banco..."
                    disabled={!tarjetaId}
                    value={bancoId}
                    onChange={(val) => {
                      setBancoId(val);
                      setPlanSeleccionadoId(null);
                    }}
                  >
                    {bancosDisponibles.map((b) => <Option key={b.id} value={b.id}>{b.nombre}</Option>)}
                  </Select>
                </div>

                <div>
                  <Text style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Cuotas y Recargo</Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="3. Seleccione Plan..."
                    disabled={!bancoId}
                    value={planSeleccionadoId}
                    onChange={setPlanSeleccionadoId}
                  >
                    {planesFiltrados.map((plan: any) => {
                      const cuotas = plan.cuotas || plan.cantidadCuotas || 1;
                      return (
                        <Option key={plan.id} value={plan.id}>
                          {plan.nombre ? `${plan.nombre} - ` : ''}{cuotas} cuotas (+{Number(plan.tasaFinanciacion)}%)
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Detalle de la Simulación" size="small" styles={{ body: { padding: 0 } }}>
            <Table
              columns={columnasCarrito}
              dataSource={carrito}
              rowKey="productoId"
              pagination={false}
              locale={{ emptyText: 'No hay productos en el carrito' }}
            />

            <div style={{ padding: '24px', background: '#fafafa', textAlign: 'right' }}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Subtotal Productos: <strong>{formatearDinero(subtotalPresupuesto)}</strong>
                </Text>
              </div>

              {modoPago === 'PLAN' && planActivo && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="danger" style={{ fontSize: 15 }}>
                    Recargo {planActivo.tarjeta?.nombre} {planActivo.banco?.nombre} (+{tasaInteres}%):{' '}
                    <strong>+ {formatearDinero(recargoTarjeta)}</strong>
                  </Text>
                </div>
              )}

              <Title level={4} style={{ margin: 0 }}>
                Total: <span style={{ color: '#1890ff' }}>{formatearDinero(totalPresupuesto)}</span>
              </Title>

              {modoPago === 'PLAN' && planActivo && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="geekblue" style={{ fontSize: 14, padding: '4px 10px' }}>
                    {cantidadCuotas} cuota{cantidadCuotas > 1 ? 's' : ''} de {formatearDinero(valorCuota)}
                  </Tag>
                </div>
              )}

              <Divider style={{ margin: '16px 0' }} />
              <Space>
                <Button
                  onClick={() => {
                    setCarrito([]);
                    setClienteId(null);
                    limpiarFinanciacion();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  danger
                  icon={<FilePdfOutlined />}
                  onClick={handleGenerarPDF}
                  loading={pdfMutation.isPending}
                  disabled={carrito.length === 0 || !clienteId}
                >
                  Descargar PDF
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};