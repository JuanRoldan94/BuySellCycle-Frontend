import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, Button, Space, Tag, Modal, Input, Select,
    Typography, Card, Tooltip, message, Alert, Descriptions, Row, Col
} from 'antd';
import {
    ShoppingCartOutlined, PlusOutlined, EyeOutlined, EditOutlined,
    FilePdfOutlined, MailOutlined, SearchOutlined, ShopOutlined, CarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getVentas, actualizarEstadoVenta, reenviarMailVenta } from '../services/ventas.service';

const { Title, Text } = Typography;

interface VentaHistorial {
    id: number;
    fechaCreacion: string;
    montoTotal: number;
    estado: string;
    motivoCancelacion?: string;
    modoPago: string;
    modoEntrega?: string;
    direccionEntregaTexto?: string;
    cliente: { nombre: string; apellido: string; dni: string; email?: string };
    sucursal: { nombre: string };
    detalles: {
        id: number;
        productoId: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        producto: { nombre: string };
    }[];
}

const ESTADOS_INFO: Record<string, { color: string; label: string }> = {
    EN_PREPARACION: { color: 'orange', label: 'En Preparación' },
    DISPONIBLE_PARA_RETIRAR: { color: 'cyan', label: 'Disponible para Retirar' },
    EN_CAMINO: { color: 'blue', label: 'En Camino' },
    ENTREGADO: { color: 'green', label: 'Entregado' },
    CANCELADO: { color: 'red', label: 'Cancelado' },
};

export const HistorialVentas = () => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState<VentaHistorial[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
    const [filtroEntrega, setFiltroEntrega] = useState<string>('TODOS');
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [ventaActiva, setVentaActiva] = useState<VentaHistorial | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [actualizando, setActualizando] = useState(false);

    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [ventaDetalle, setVentaDetalle] = useState<VentaHistorial | null>(null);
    const [enviandoMailId, setEnviandoMailId] = useState<number | null>(null);

    const cargarVentas = async () => {
        try {
            const data = await getVentas();
            setVentas(data);
        } catch (error) {
            console.error('Error al cargar el historial:', error);
            message.error('Error al cargar el historial de ventas');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, []);

    const handleReenviarMail = (venta: VentaHistorial) => {
        if (!venta.cliente?.email) {
            message.warning(`El cliente ${venta.cliente.nombre} ${venta.cliente.apellido} no tiene un email registrado.`);
            return;
        }

        Modal.confirm({
            title: '¿Reenviar comprobante por email?',
            icon: <MailOutlined style={{ color: '#1890ff' }} />,
            content: `Se enviará el comprobante de la venta #V-${String(venta.id).padStart(4, '0')} a ${venta.cliente.email}.`,
            okText: 'Sí, enviar',
            cancelText: 'Cancelar',
            onOk: async () => {
                setEnviandoMailId(venta.id);
                try {
                    const res = await reenviarMailVenta(venta.id);
                    message.success(res.message || 'Email enviado con éxito');
                } catch (error: any) {
                    console.error('Error al enviar email de venta:', error);
                    message.error(`Error: ${error.response?.data?.message || error.message}`);
                } finally {
                    setEnviandoMailId(null);
                }
            }
        });
    };

    const getOpcionesEstado = (modoEntrega?: string) => {
        if (modoEntrega === 'RETIRO_SUCURSAL') {
            return [
                { value: 'EN_PREPARACION', label: 'En Preparación' },
                { value: 'DISPONIBLE_PARA_RETIRAR', label: 'Disponible para Retirar en Sucursal' },
                { value: 'ENTREGADO', label: 'Entregado (Retirado por Cliente)' },
                { value: 'CANCELADO', label: 'Cancelar Venta (Devuelve Stock)' },
            ];
        }
        if (modoEntrega === 'ENTREGA_DOMICILIO') {
            return [
                { value: 'EN_PREPARACION', label: 'En Preparación' },
                { value: 'EN_CAMINO', label: 'En Camino a Domicilio' },
                { value: 'ENTREGADO', label: 'Entregado en Domicilio' },
                { value: 'CANCELADO', label: 'Cancelar Venta (Devuelve Stock)' },
            ];
        }
        return [
            { value: 'EN_PREPARACION', label: '📦 En Preparación' },
            { value: 'DISPONIBLE_PARA_RETIRAR', label: '🏪 Disponible para Retirar' },
            { value: 'EN_CAMINO', label: 'En Camino' },
            { value: 'ENTREGADO', label: 'Entregado' },
            { value: 'CANCELADO', label: 'Cancelar Venta (Devuelve Stock)' },
        ];
    };

    const abrirModal = (venta: VentaHistorial) => {
        if (venta.estado === 'CANCELADO') {
            message.warning('Una venta cancelada no se puede modificar.');
            return;
        }
        if (venta.estado === 'ENTREGADO') {
            message.info('Esta venta ya fue entregada y finalizada.');
            return;
        }
        setVentaActiva(venta);
        setNuevoEstado(venta.estado);
        setMotivoCancelacion('');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setVentaActiva(null);
        setMotivoCancelacion('');
    };

    const abrirModalDetalle = (venta: VentaHistorial) => {
        setVentaDetalle(venta);
        setModalDetalleAbierto(true);
    };

    const cerrarModalDetalle = () => {
        setModalDetalleAbierto(false);
        setVentaDetalle(null);
    };

    const handleGuardarEstado = async () => {
        if (!ventaActiva || nuevoEstado === ventaActiva.estado) {
            cerrarModal();
            return;
        }

        if (nuevoEstado === 'CANCELADO') {
            if (!motivoCancelacion.trim()) {
                message.error('Debe especificar un motivo de cancelación obligatorio.');
                return;
            }
        }

        setActualizando(true);

        try {
            await actualizarEstadoVenta(
                ventaActiva.id,
                nuevoEstado,
                nuevoEstado === 'CANCELADO' ? motivoCancelacion.trim() : undefined
            );
            message.success('Estado de la venta actualizado correctamente');
            await cargarVentas();
            cerrarModal();
        } catch (error: any) {
            console.error('Error al actualizar', error);
            message.error(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setActualizando(false);
        }
    };

    const ventasFiltradas = ventas.filter((v) => {
        const termino = busqueda.toLowerCase().trim();
        const coincideTermino = !termino || (
            v.id.toString().includes(termino) ||
            v.cliente?.dni?.includes(termino) ||
            `${v.cliente?.nombre || ''} ${v.cliente?.apellido || ''}`.toLowerCase().includes(termino) ||
            v.sucursal?.nombre?.toLowerCase().includes(termino)
        );

        const coincideEstado = filtroEstado === 'TODOS' || v.estado === filtroEstado;
        const coincideEntrega = filtroEntrega === 'TODOS' || v.modoEntrega === filtroEntrega;

        return coincideTermino && coincideEstado && coincideEntrega;
    });

    const columns: ColumnsType<VentaHistorial> = [

        {
            title: 'Fecha',
            dataIndex: 'fechaCreacion',
            key: 'fechaCreacion',
            width: 105,
            render: (f: string) => new Date(f).toLocaleDateString('es-AR'),
        },
        {
            title: 'Cliente',
            key: 'cliente',
            render: (_, v) => (
                <div>
                    <Text strong style={{ display: 'block' }}>
                        {v.cliente?.nombre} {v.cliente?.apellido}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        DNI: {v.cliente?.dni}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Entrega',
            key: 'entrega',
            width: 175,
            render: (_, v) => (
                <div>
                    <Tag
                        color={v.modoEntrega === 'RETIRO_SUCURSAL' ? 'cyan' : 'blue'}
                        icon={v.modoEntrega === 'RETIRO_SUCURSAL' ? <ShopOutlined /> : <CarOutlined />}
                        style={{ fontWeight: 600 }}
                    >
                        {v.modoEntrega === 'RETIRO_SUCURSAL' ? 'En Sucursal' : 'A Domicilio'}
                    </Tag>
                    {v.modoEntrega === 'RETIRO_SUCURSAL' ? (
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                            {v.sucursal?.nombre}
                        </div>
                    ) : (
                        v.direccionEntregaTexto && (
                            <Tooltip title={v.direccionEntregaTexto}>
                                <div style={{
                                    fontSize: 11,
                                    color: '#8c8c8c',
                                    maxWidth: 150,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginTop: 2
                                }}>
                                    📍 {v.direccionEntregaTexto}
                                </div>
                            </Tooltip>
                        )
                    )}
                </div>
            ),
        },
        {
            title: 'Pago',
            dataIndex: 'modoPago',
            key: 'modoPago',
            width: 120,
            render: (modo: string) => (
                <Tag color={modo === 'CONTADO' ? 'success' : 'processing'}>
                    {modo === 'CONTADO' ? '💵 Contado' : '💳 Plan'}
                </Tag>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'montoTotal',
            key: 'montoTotal',
            align: 'right',
            width: 125,
            render: (total: number) => (
                <Text strong style={{ fontSize: 14 }}>
                    ${Number(total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
            ),
        },
        {
            title: 'Estado',
            key: 'estado',
            width: 190,
            render: (_, v) => {
                const info = ESTADOS_INFO[v.estado] || { color: 'default', label: v.estado };
                return (
                    <div>
                        <Tag color={info.color} style={{ fontWeight: 600 }}>
                            {info.label.toUpperCase()}
                        </Tag>
                        {v.estado === 'CANCELADO' && v.motivoCancelacion && (
                            <Tooltip title={v.motivoCancelacion}>
                                <div style={{
                                    fontSize: 11,
                                    color: '#ff4d4f',
                                    marginTop: 4,
                                    maxWidth: 165,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <strong>Motivo:</strong> {v.motivoCancelacion}
                                </div>
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Acciones',
            key: 'acciones',
            align: 'center',
            width: 160,
            render: (_, v) => (
                <Space size="small">
                    <Tooltip title="Ver detalle de productos">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => abrirModalDetalle(v)}
                        />
                    </Tooltip>
                    <Tooltip title={
                        v.estado === 'CANCELADO'
                            ? 'Venta cancelada (no modificable)'
                            : v.estado === 'ENTREGADO'
                                ? 'Venta ya entregada y finalizada'
                                : 'Cambiar estado'
                    }>
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: (v.estado === 'CANCELADO' || v.estado === 'ENTREGADO') ? '#d9d9d9' : '#faad14' }} />}
                            disabled={v.estado === 'CANCELADO' || v.estado === 'ENTREGADO'}
                            onClick={() => abrirModal(v)}
                        />
                    </Tooltip>
                    <Tooltip title="Descargar Comprobante PDF">
                        <Button
                            type="text"
                            icon={<FilePdfOutlined style={{ color: '#ff4d4f' }} />}
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pdf/venta/${v.id}`}
                            target="_blank"
                        />
                    </Tooltip>
                    <Tooltip title="Reenviar Comprobante por Email">
                        <Button
                            type="text"
                            icon={<MailOutlined style={{ color: '#52c41a' }} />}
                            loading={enviandoMailId === v.id}
                            onClick={() => handleReenviarMail(v)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space align="center">
                            <ShoppingCartOutlined style={{ fontSize: 26, color: '#1890ff' }} />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>Historial de Ventas</Title>
                                <Text type="secondary">Consulte, filtre por estado y modalidad, y gestione el ciclo de entrega</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/ventas/nueva')}
                        >
                            Nueva Venta
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
                    <Col xs={24} md={10}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Buscar por Nro de venta, DNI o cliente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <Select
                            style={{ width: '100%' }}
                            value={filtroEstado}
                            onChange={setFiltroEstado}
                            options={[
                                { value: 'TODOS', label: '📌 Todos los Estados' },
                                { value: 'EN_PREPARACION', label: '📦 En Preparación' },
                                { value: 'DISPONIBLE_PARA_RETIRAR', label: '🏪 Disponible para Retirar' },
                                { value: 'EN_CAMINO', label: '🚚 En Camino' },
                                { value: 'ENTREGADO', label: '✅ Entregado' },
                                { value: 'CANCELADO', label: '❌ Cancelado' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <Select
                            style={{ width: '100%' }}
                            value={filtroEntrega}
                            onChange={setFiltroEntrega}
                            options={[
                                { value: 'TODOS', label: '📦 Todas las Modalidades' },
                                { value: 'RETIRO_SUCURSAL', label: '🏢 Retiro en Sucursal' },
                                { value: 'ENTREGA_DOMICILIO', label: '🚚 Entrega a Domicilio' },
                            ]}
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={ventasFiltradas}
                    rowKey="id"
                    loading={cargando}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <span>Modificar Estado - Venta #V-{String(ventaActiva?.id).padStart(4, '0')}</span>
                    </Space>
                }
                open={modalAbierto}
                onCancel={cerrarModal}
                onOk={handleGuardarEstado}
                confirmLoading={actualizando}
                okText="Guardar Cambios"
                cancelText="Cancelar"
            >
                {ventaActiva && (
                    <div>
                        <Descriptions size="small" column={1} bordered style={{ marginBottom: 16, marginTop: 12 }}>
                            <Descriptions.Item label="Cliente">
                                {ventaActiva.cliente?.nombre} {ventaActiva.cliente?.apellido} (DNI: {ventaActiva.cliente?.dni})
                            </Descriptions.Item>
                            <Descriptions.Item label="Modalidad de Entrega">
                                <Tag
                                    color={ventaActiva.modoEntrega === 'RETIRO_SUCURSAL' ? 'cyan' : 'blue'}
                                    icon={ventaActiva.modoEntrega === 'RETIRO_SUCURSAL' ? <ShopOutlined /> : <CarOutlined />}
                                    style={{ fontWeight: 600 }}
                                >
                                    {ventaActiva.modoEntrega === 'RETIRO_SUCURSAL' ? 'Retiro en Sucursal' : 'Entrega a Domicilio'}
                                </Tag>
                                {ventaActiva.modoEntrega === 'RETIRO_SUCURSAL' ? (
                                    <Text type="secondary" style={{ marginLeft: 6 }}>
                                        ({ventaActiva.sucursal?.nombre})
                                    </Text>
                                ) : (
                                    ventaActiva.direccionEntregaTexto && (
                                        <Text type="secondary" style={{ marginLeft: 6 }}>
                                            ({ventaActiva.direccionEntregaTexto})
                                        </Text>
                                    )
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Venta">
                                <strong>${Number(ventaActiva.montoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 6 }}>Nuevo Estado:</Text>
                            <Select
                                style={{ width: '100%' }}
                                value={nuevoEstado}
                                onChange={setNuevoEstado}
                                options={getOpcionesEstado(ventaActiva.modoEntrega)}
                            />
                        </div>

                        {nuevoEstado === 'DISPONIBLE_PARA_RETIRAR' && (
                            <Alert
                                type="info"
                                showIcon
                                message="Listo para Retiro en Sucursal"
                                description={`El pedido queda preparado y disponible para que el cliente lo retire en "${ventaActiva.sucursal?.nombre}". Se notificará automáticamente al correo del cliente.`}
                                style={{ marginBottom: 12 }}
                            />
                        )}

                        {nuevoEstado === 'EN_CAMINO' && (
                            <Alert
                                type="info"
                                showIcon
                                message="Despacho en Camino a Domicilio"
                                description={`El pedido sale en transporte hacia el domicilio del cliente (${ventaActiva.direccionEntregaTexto || 'dirección registrada'}). Se notificará automáticamente al cliente.`}
                                style={{ marginBottom: 12 }}
                            />
                        )}

                        {nuevoEstado === 'CANCELADO' && (
                            <div style={{ marginTop: 16 }}>
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="Devolución Automática de Stock"
                                    description="Al cancelar la venta, los productos volverán automáticamente al stock general y la venta no podrá reactivarse."
                                    style={{ marginBottom: 12 }}
                                />
                                <Text strong style={{ display: 'block', marginBottom: 6, color: '#ff4d4f' }}>
                                    Motivo de Cancelación: *
                                </Text>
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Especifique el motivo obligatorio de la cancelación..."
                                    value={motivoCancelacion}
                                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <Space>
                        <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                        <span>Detalle de Venta #V-{String(ventaDetalle?.id).padStart(4, '0')}</span>
                    </Space>
                }
                open={modalDetalleAbierto}
                onCancel={cerrarModalDetalle}
                footer={[
                    <Button key="close" onClick={cerrarModalDetalle}>
                        Cerrar
                    </Button>
                ]}
                width={700}
            >
                {ventaDetalle && (
                    <div>
                        <Descriptions size="small" column={2} bordered style={{ marginBottom: 16, marginTop: 12 }}>
                            <Descriptions.Item label="Cliente">
                                {ventaDetalle.cliente?.nombre} {ventaDetalle.cliente?.apellido}
                            </Descriptions.Item>
                            <Descriptions.Item label="DNI">
                                {ventaDetalle.cliente?.dni}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sucursal">
                                {ventaDetalle.sucursal?.nombre}
                            </Descriptions.Item>
                            <Descriptions.Item label="Modo de Pago">
                                <Tag color={ventaDetalle.modoPago === 'CONTADO' ? 'success' : 'processing'}>
                                    {ventaDetalle.modoPago}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Modalidad de Entrega">
                                <Tag
                                    color={ventaDetalle.modoEntrega === 'RETIRO_SUCURSAL' ? 'cyan' : 'blue'}
                                    icon={ventaDetalle.modoEntrega === 'RETIRO_SUCURSAL' ? <ShopOutlined /> : <CarOutlined />}
                                    style={{ fontWeight: 600 }}
                                >
                                    {ventaDetalle.modoEntrega === 'RETIRO_SUCURSAL' ? 'Retiro en Sucursal' : 'Entrega a Domicilio'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Estado Actual">
                                <Tag color={ESTADOS_INFO[ventaDetalle.estado]?.color || 'default'} style={{ fontWeight: 600 }}>
                                    {ESTADOS_INFO[ventaDetalle.estado]?.label || ventaDetalle.estado}
                                </Tag>
                            </Descriptions.Item>
                            {ventaDetalle.modoEntrega === 'ENTREGA_DOMICILIO' && ventaDetalle.direccionEntregaTexto && (
                                <Descriptions.Item label="Dirección de Envío" span={2}>
                                    📍 {ventaDetalle.direccionEntregaTexto}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {ventaDetalle.estado === 'CANCELADO' && (
                            <Alert
                                type="error"
                                showIcon
                                message="Venta Cancelada"
                                description={
                                    ventaDetalle.motivoCancelacion ? (
                                        <div><strong>Motivo:</strong> {ventaDetalle.motivoCancelacion}</div>
                                    ) : 'Sin motivo especificado'
                                }
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Table
                            size="small"
                            columns={[
                                {
                                    title: 'Producto',
                                    key: 'producto',
                                    render: (_, item) => item.producto?.nombre || `Producto #${item.productoId}`,
                                },
                                {
                                    title: 'Cant.',
                                    dataIndex: 'cantidad',
                                    align: 'center',
                                    width: 70,
                                },
                                {
                                    title: 'Precio Unit.',
                                    dataIndex: 'precioUnitario',
                                    align: 'right',
                                    render: (p: number) => `$${Number(p || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
                                },
                                {
                                    title: 'Subtotal',
                                    dataIndex: 'subtotal',
                                    align: 'right',
                                    render: (s: number) => (
                                        <Text strong>
                                            ${Number(s || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    ),
                                },
                            ]}
                            dataSource={ventaDetalle.detalles}
                            pagination={false}
                            rowKey="id"
                        />

                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Text style={{ fontSize: 16, marginRight: 8 }}>Total Facturado:</Text>
                            <Text strong style={{ fontSize: 22, color: '#52c41a' }}>
                                ${Number(ventaDetalle.montoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
