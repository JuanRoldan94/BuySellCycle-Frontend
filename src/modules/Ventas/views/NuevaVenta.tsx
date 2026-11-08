import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Card, Row, Col, Typography, Button, Space, Table, 
    InputNumber, Divider, Statistic, Tag, Empty, message, Modal 
} from 'antd';
import { 
    ShoppingCartOutlined, ArrowLeftOutlined, DeleteOutlined, 
    CheckCircleOutlined, DollarOutlined, AppstoreAddOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { useVentaStore } from '../store/useVentaStore';
import { BuscadorProductos } from '../components/BuscadorProductos';
import { SelectorCliente } from '../components/SelectorCliente';
import { PanelSucursalEntrega } from '../components/PanelSucursalEntrega';
import { PanelFinanciacion } from '../components/PanelFinanciacion';
import { registrarVenta } from '../services/ventas.service';

const { Title, Text } = Typography;

export const NuevaVenta = () => {
    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(false);

    const {
        detalles, clienteId, sucursalId, modoPago, planId, modoEntrega, tasaFinanciacion, direccionEntregaTexto,
        removerProducto, vaciarCarrito, actualizarCantidad
    } = useVentaStore();

    const subtotal = detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const recargoCalculado = modoPago === 'PLAN' ? subtotal * (tasaFinanciacion / 100) : 0;
    const totalCalculado = subtotal + recargoCalculado;

    const handleConfirmarVenta = async () => {
        if (!clienteId) {
            message.warning('Debe seleccionar un cliente antes de confirmar la venta.');
            return;
        }

        if (!sucursalId) {
            message.warning('Debe seleccionar una sucursal de origen.');
            return;
        }

        if (detalles.length === 0) {
            message.warning('El carrito está vacío. Agregue al menos un producto.');
            return;
        }

        if (modoEntrega === 'ENTREGA_DOMICILIO' && !direccionEntregaTexto.trim()) {
            message.warning('Debe ingresar la dirección para "Entrega a domicilio".');
            return;
        }

        if (modoPago === 'PLAN' && !planId) {
            message.warning('Debe seleccionar tarjeta, banco y plan de cuotas para el pago financiado.');
            return;
        }

        const payload = {
            clienteId,
            sucursalId,
            planId: modoPago === 'CONTADO' ? 6 : planId,
            modoPago,
            modoEntrega,
            direccionEntregaTexto: modoEntrega === 'ENTREGA_DOMICILIO' ? direccionEntregaTexto.trim() : null,
            detalles: detalles.map(d => ({
                productoId: d.productoId,
                cantidad: d.cantidad
            }))
        };

        setProcesando(true);
        try {
            const data = await registrarVenta(payload as any);
            Modal.success({
                title: '¡Venta Registrada con Éxito!',
                content: `Venta #V-${String(data.id).padStart(4, '0')} fue registrada y el comprobante ha sido generado.`,
                okText: 'Ir al Historial',
                onOk: () => {
                    vaciarCarrito();
                    navigate('/ventas/historial');
                }
            });
        } catch (error: any) {
            console.error('Error al registrar venta:', error);
            message.error(error.response?.data?.message || 'Error al procesar la venta');
        } finally {
            setProcesando(false);
        }
    };

    const columnsCart: ColumnsType<any> = [
        {
            title: 'Producto',
            dataIndex: 'nombre',
            key: 'nombre',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Precio Lista',
            dataIndex: 'precio',
            key: 'precio',
            align: 'right',
            width: 120,
            render: (val: number) => `$${Number(val || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        },
        {
            title: 'Cantidad',
            key: 'cantidad',
            align: 'center',
            width: 130,
            render: (_, item) => (
                <InputNumber
                    min={1}
                    max={item.stockMaximo}
                    value={item.cantidad}
                    onChange={(nuevaCant) => {
                        actualizarCantidad(item.productoId, nuevaCant || 1);
                    }}
                />
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            align: 'right',
            width: 130,
            render: (_, item) => (
                <Text strong style={{ color: '#1890ff' }}>
                    ${Number(item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
            ),
        },
        {
            title: '',
            key: 'acciones',
            align: 'center',
            width: 60,
            render: (_, item) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removerProducto(item.productoId)}
                    title="Quitar producto"
                />
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1250, margin: '0 auto' }}>
            <Card style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space align="center">
                            <ShoppingCartOutlined style={{ fontSize: 26, color: '#1890ff' }} />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>Registrar Nueva Venta</Title>
                                <Text type="secondary">Seleccione productos, cliente y forma de pago para emitir una nueva orden</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/ventas/historial')}
                        >
                            Volver al Historial
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={15}>
                    <Card
                        title={
                            <Space>
                                <AppstoreAddOutlined style={{ color: '#1890ff' }} />
                                <span>Productos en el Carrito</span>
                            </Space>
                        }
                        extra={
                            detalles.length > 0 && (
                                <Button type="link" danger onClick={vaciarCarrito}>
                                    Vaciar Carrito
                                </Button>
                            )
                        }
                        style={{ height: '100%' }}
                    >
                        <BuscadorProductos />

                        <Table
                            columns={columnsCart}
                            dataSource={detalles}
                            rowKey="productoId"
                            pagination={false}
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="El carrito está vacío. Busque y agregue productos arriba."
                                    />
                                )
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={9}>
                    <Card
                        title={
                            <Space>
                                <DollarOutlined style={{ color: '#52c41a' }} />
                                <span>Resumen y Facturación</span>
                            </Space>
                        }
                    >
                        <SelectorCliente />
                        <Divider style={{ margin: '14px 0' }} />

                        <PanelSucursalEntrega />
                        <Divider style={{ margin: '14px 0' }} />

                        <PanelFinanciacion />
                        <Divider style={{ margin: '14px 0' }} />

                        <div
                            style={{
                                background: '#fafafa',
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                padding: 16,
                                marginBottom: 16,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Subtotal Productos:</Text>
                                <Text strong>${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
                            </div>

                            {modoPago === 'PLAN' && tasaFinanciacion > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#cf1322' }}>
                                    <span>
                                        Recargo Plan Financiado <Tag color="red">+{tasaFinanciacion}%</Tag>:
                                    </span>
                                    <span>+${recargoCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <Divider style={{ margin: '10px 0' }} />

                            <Statistic
                                title="Total a Pagar"
                                value={totalCalculado}
                                precision={2}
                                prefix="$"
                                valueStyle={{ color: '#3f8600', fontWeight: 'bold', fontSize: 24 }}
                            />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<CheckCircleOutlined />}
                            onClick={handleConfirmarVenta}
                            loading={procesando}
                            disabled={detalles.length === 0}
                            style={{
                                height: 46,
                                fontSize: 16,
                                fontWeight: 600,
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                            }}
                        >
                            Confirmar Venta
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
