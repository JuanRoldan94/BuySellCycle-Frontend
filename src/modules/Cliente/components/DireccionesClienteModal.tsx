import React from 'react';
import { 
  Modal, Table, Button, Input, Checkbox, Form, Space, 
  Tag, Popconfirm, message, Typography, Card, Tooltip, Row, Col 
} from 'antd';
import { 
  EnvironmentOutlined, PlusOutlined, StarOutlined, 
  StarFilled, DeleteOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDireccionesCliente, createDireccionCliente, 
  updateDireccionCliente, deleteDireccionCliente 
} from '../services/cliente.service';
import type { Cliente, DireccionEntrega } from '../types/cliente.type';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface DireccionesClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export const DireccionesClienteModal: React.FC<DireccionesClienteModalProps> = ({
  isOpen,
  onClose,
  cliente,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const clienteId = cliente?.id || 0;

  const { data: direcciones, isLoading } = useQuery({
    queryKey: ['direcciones', clienteId],
    queryFn: () => getDireccionesCliente(clienteId),
    enabled: isOpen && clienteId > 0,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['direcciones', clienteId] });
    queryClient.invalidateQueries({ queryKey: ['clientes'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: { direccion: string; principal?: boolean }) =>
      createDireccionCliente(clienteId, data),
    onSuccess: () => {
      message.success('Dirección de entrega agregada');
      form.resetFields();
      invalidate();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al agregar la dirección');
    },
  });

  const setPrincipalMutation = useMutation({
    mutationFn: (direccionId: number) =>
      updateDireccionCliente(clienteId, direccionId, { principal: true }),
    onSuccess: () => {
      message.success('Dirección marcada como principal');
      invalidate();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar la dirección');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (direccionId: number) =>
      deleteDireccionCliente(clienteId, direccionId),
    onSuccess: () => {
      message.success('Dirección eliminada');
      invalidate();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar la dirección');
    },
  });

  const handleAgregar = () => {
    form.validateFields().then((values) => {
      createMutation.mutate({
        direccion: values.direccion.trim(),
        principal: values.principal || false,
      });
    });
  };

  const columns: ColumnsType<DireccionEntrega> = [
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (dir: string, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: record.principal ? '#52c41a' : '#8c8c8c' }} />
          <Text strong={record.principal}>{dir}</Text>
        </Space>
      ),
    },
    {
      title: 'Tipo',
      key: 'principal',
      width: 140,
      align: 'center',
      render: (_, record) =>
        record.principal ? (
          <Tag color="success" icon={<StarFilled style={{ color: '#faad14' }} />}>
            Principal
          </Tag>
        ) : (
          <Tooltip title="Hacer principal">
            <Button
              size="small"
              type="text"
              icon={<StarOutlined />}
              onClick={() => setPrincipalMutation.mutate(record.id)}
              loading={setPrincipalMutation.isPending}
            >
              Hacer Principal
            </Button>
          </Tooltip>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar dirección?"
          description="¿Está seguro de eliminar esta dirección de entrega?"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="Sí, eliminar"
          cancelText="Cancelar"
        >
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <span>
            Direcciones de Entrega — {cliente?.nombre} {cliente?.apellido}
          </span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
      width={680}
    >
      <Card
        size="small"
        title={<Text strong>Agregar Nueva Dirección</Text>}
        style={{ marginBottom: 16, marginTop: 12, background: '#fafafa' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={12} align="bottom">
            <Col xs={24} sm={15}>
              <Form.Item
                name="direccion"
                label="Dirección de entrega"
                rules={[{ required: true, message: 'Ingrese la dirección' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Ej: Av. Rivadavia 4520, Piso 3 Depto B"
                />
              </Form.Item>
            </Col>
            <Col xs={14} sm={5}>
              <Form.Item
                name="principal"
                valuePropName="checked"
                style={{ marginBottom: 4 }}
              >
                <Checkbox defaultChecked={(direcciones?.length || 0) === 0}>
                  Principal
                </Checkbox>
              </Form.Item>
            </Col>
            <Col xs={10} sm={4}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAgregar}
                loading={createMutation.isPending}
                block
              >
                Agregar
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={direcciones || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="small"
        locale={{
          emptyText: 'El cliente no tiene direcciones de entrega registradas todavía.',
        }}
      />
    </Modal>
  );
};
