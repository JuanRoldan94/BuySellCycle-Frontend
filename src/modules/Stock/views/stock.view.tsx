import React from 'react';
import { Tabs, Form, Input, InputNumber, Select, Button, message, Card, Typography, Row, Col } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, SwapOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { registrarIngreso, registrarEgreso, registrarTransferencia } from '../services/stock.service';
import { getProductos } from '../../Productos/services/producto.service';
import { getDepositos } from '../../Deposito/services/deposito.service';
import { getProveedores } from '../../Proveedores/services/Proveedores.service';

const { Title } = Typography;
const { Option } = Select;

export const StockView: React.FC = () => {
    const { data: productos, isLoading: loadingProd } = useQuery({ queryKey: ['productos'], queryFn: getProductos });
    const { data: depositos, isLoading: loadingDep } = useQuery({ queryKey: ['depositos'], queryFn: getDepositos });
    const { data: proveedores, isLoading: loadingProv } = useQuery({ queryKey: ['proveedores'], queryFn: getProveedores });
    const [formIngreso] = Form.useForm();
    const [formEgreso] = Form.useForm();
    const [formTransferencia] = Form.useForm();

    const ingresoMutation = useMutation({
        mutationFn: registrarIngreso,
        onSuccess: () => {
            message.success('Ingreso registrado correctamente');
            formIngreso.resetFields();
        },
        onError: (err: any) => message.error(err.response?.data?.message || 'Error en el ingreso')
    });

    const egresoMutation = useMutation({
        mutationFn: registrarEgreso,
        onSuccess: () => {
            message.success('Egreso registrado correctamente');
            formEgreso.resetFields();
        },
        onError: (err: any) => message.error(err.response?.data?.message || 'Error en el egreso')
    });

    const transferenciaMutation = useMutation({
        mutationFn: registrarTransferencia,
        onSuccess: () => {
            message.success('Transferencia registrada correctamente');
            formTransferencia.resetFields();
        },
        onError: (err: any) => message.error(err.response?.data?.message || 'Error en la transferencia')
    });

    const items = [
        {
            key: '1',
            label: <span style={{ color: '#52c41a' }}><ArrowDownOutlined /> Ingreso de Mercadería</span>,
            children: (
                <Form form={formIngreso} layout="vertical" onFinish={(v) => ingresoMutation.mutate(v)}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children" loading={loadingProd} placeholder="Buscar producto...">
                                    {productos?.map((p: any) => <Option key={p.id} value={p.id}>[{p.codigo}] {p.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="depositoId" label="Depósito Destino" rules={[{ required: true }]}>
                                <Select loading={loadingDep} placeholder="Seleccionar depósito">
                                    {depositos?.map((d: any) => <Option key={d.id} value={d.id}>{d.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={9}>
                            <Form.Item name="proveedorId" label="Proveedor (Opcional)">
                                <Select showSearch optionFilterProp="children" loading={loadingProv} placeholder="Seleccionar..." allowClear>
                                    {proveedores?.map((p: any) => <Option key={p.id} value={p.id}>{p.razonSocial}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        {/* <Col span={9}>
                            <Form.Item name="motivo" label="Motivo / Observación" rules={[{ required: true }]}>
                                <Input placeholder="Ej: Compra a proveedor..." />
                            </Form.Item>
                        </Col> */}
                    </Row>
                    <Button type="primary" htmlType="submit" loading={ingresoMutation.isPending} style={{ background: '#52c41a' }}>
                        Registrar Ingreso
                    </Button>
                </Form>
            )
        },
        {
            key: '2',
            label: <span style={{ color: '#f5222d' }}><ArrowUpOutlined /> Egreso de Mercadería</span>,
            children: (
                <Form form={formEgreso} layout="vertical" onFinish={(v) => egresoMutation.mutate(v)}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children" loading={loadingProd} placeholder="Buscar producto...">
                                    {productos?.map((p: any) => <Option key={p.id} value={p.id}>[{p.codigo}] {p.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="depositoId" label="Depósito Origen" rules={[{ required: true }]}>
                                <Select loading={loadingDep} placeholder="Seleccionar depósito">
                                    {depositos?.map((d: any) => <Option key={d.id} value={d.id}>{d.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="motivo" label="Motivo / Observación" rules={[{ required: true }]}>
                                <Input placeholder="Ej: Venta, Rotura, Pérdida..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" danger htmlType="submit" loading={egresoMutation.isPending}>
                        Registrar Egreso
                    </Button>
                </Form>
            )
        },
        {
            key: '3',
            label: <span style={{ color: '#1890ff' }}><SwapOutlined /> Transferencia entre Depósitos</span>,
            children: (
                <Form form={formTransferencia} layout="vertical" onFinish={(v) => transferenciaMutation.mutate(v)}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="productoId" label="Producto a Transferir" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children" loading={loadingProd} placeholder="Buscar producto...">
                                    {productos?.map((p: any) => <Option key={p.id} value={p.id}>[{p.codigo}] {p.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="depositoOrigenId" label="Depósito Origen" rules={[{ required: true }]}>
                                <Select loading={loadingDep} placeholder="Sale de...">
                                    {depositos?.map((d: any) => <Option key={d.id} value={d.id}>{d.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="depositoDestinoId" label="Depósito Destino" rules={[{ required: true }]}>
                                <Select loading={loadingDep} placeholder="Entra a...">
                                    {depositos?.map((d: any) => <Option key={d.id} value={d.id}>{d.nombre}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="motivo" label="Motivo" rules={[{ required: true }]}>
                                <Input placeholder="Ej: Reabastecimiento de sucursal..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" loading={transferenciaMutation.isPending}>
                        Ejecutar Transferencia
                    </Button>
                </Form>
            )
        }
    ];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: 24 }}>Movimientos de Inventario</Title>
            <Card>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};