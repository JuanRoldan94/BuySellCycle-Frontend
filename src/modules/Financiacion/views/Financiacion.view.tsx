import React, { useState } from 'react';
import { Tabs, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CreditCardOutlined, BankOutlined, PercentageOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { 
  getBancos, createBanco, updateBanco, deleteBanco,
  getTarjetas, createTarjeta, updateTarjeta, deleteTarjeta,
  getPlanes, createPlan, updatePlan, deletePlan
} from '../services/Financiacion.service';

const { Title } = Typography;
const { Option } = Select;

// ==========================================
// 1. PESTAÑA: BANCOS
// ==========================================
const TabBancos = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: bancos, isLoading } = useQuery({ queryKey: ['bancos'], queryFn: getBancos });

  const mutationGuardar = useMutation({
    mutationFn: editingId ? (data: any) => updateBanco({ id: editingId, data }) : createBanco,
    onSuccess: () => {
      message.success(`Banco ${editingId ? 'actualizado' : 'creado'} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
      setIsModalOpen(false);
    }
  });

  const mutationEliminar = useMutation({
    mutationFn: deleteBanco,
    onSuccess: () => {
      message.success('Banco eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
    }
  });

  const abrirModal = (banco?: any) => {
    form.resetFields();
    if (banco) {
      setEditingId(banco.id);
      form.setFieldsValue(banco);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Nombre del Banco', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => abrirModal(record)} />
          <Popconfirm title="¿Eliminar banco?" onConfirm={() => mutationEliminar.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>Nuevo Banco</Button>
      </div>
      <Table columns={columns} dataSource={bancos} rowKey="id" loading={isLoading} size="small" />

      <Modal
        title={editingId ? 'Editar Banco' : 'Nuevo Banco'}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={mutationGuardar.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => mutationGuardar.mutate(values)}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
            <Input placeholder="Ej: Banco Galicia" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ==========================================
// 2. PESTAÑA: TARJETAS
// ==========================================
const TabTarjetas = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: tarjetas, isLoading } = useQuery({ queryKey: ['tarjetas'], queryFn: getTarjetas });

  const mutationGuardar = useMutation({
    mutationFn: editingId ? (data: any) => updateTarjeta({ id: editingId, data }) : createTarjeta,
    onSuccess: () => {
      message.success(`Tarjeta ${editingId ? 'actualizada' : 'creada'} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['tarjetas'] });
      setIsModalOpen(false);
    }
  });

  const mutationEliminar = useMutation({
    mutationFn: deleteTarjeta,
    onSuccess: () => {
      message.success('Tarjeta eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['tarjetas'] });
    }
  });

  const abrirModal = (tarjeta?: any) => {
    form.resetFields();
    if (tarjeta) {
      setEditingId(tarjeta.id);
      form.setFieldsValue(tarjeta);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'Tipo', dataIndex: 'tipo' },
    {
      title: 'Acciones',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => abrirModal(record)} />
          <Popconfirm title="¿Eliminar tarjeta?" onConfirm={() => mutationEliminar.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>Nueva Tarjeta</Button>
      </div>
      <Table columns={columns} dataSource={tarjetas} rowKey="id" loading={isLoading} size="small" />

      <Modal
        title={editingId ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={mutationGuardar.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => mutationGuardar.mutate(values)}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Ej: Visa" />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo de Tarjeta" rules={[{ required: true }]}>
            <Select placeholder="Seleccione tipo">
              <Option value="CREDITO">Crédito</Option>
              <Option value="DEBITO">Débito</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ==========================================
// 3. PESTAÑA: PLANES (Combina Banco y Tarjeta)
// ==========================================
const TabPlanes = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: planes, isLoading: loadPlanes } = useQuery({ queryKey: ['planes'], queryFn: getPlanes });
  const { data: bancos, isLoading: loadBancos } = useQuery({ queryKey: ['bancos'], queryFn: getBancos });
  const { data: tarjetas, isLoading: loadTarjetas } = useQuery({ queryKey: ['tarjetas'], queryFn: getTarjetas });

  const mutationGuardar = useMutation({
    mutationFn: editingId ? (data: any) => updatePlan({ id: editingId, data }) : createPlan,
    onSuccess: () => {
      message.success(`Plan ${editingId ? 'actualizado' : 'creado'} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      setIsModalOpen(false);
    }
  });

  const mutationEliminar = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      message.success('Plan eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['planes'] });
    }
  });

  const abrirModal = (plan?: any) => {
    form.resetFields();
    if (plan) {
      setEditingId(plan.id);
      form.setFieldsValue(plan);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Tarjeta', key: 'tarjeta', render: (r: any) => r.tarjeta?.nombre },
    { title: 'Banco', key: 'banco', render: (r: any) => r.banco?.nombre },
    { title: 'Cuotas', dataIndex: 'cantidadCuotas', align: 'center' as const },
    { title: 'Interés (%)', dataIndex: 'tasaFinanciacion', align: 'right' as const, render: (v: number) => `${v}%` },
    {
      title: 'Acciones',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => abrirModal(record)} />
          <Popconfirm title="¿Eliminar plan?" onConfirm={() => mutationEliminar.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>Nuevo Plan</Button>
      </div>
      <Table columns={columns} dataSource={planes} rowKey="id" loading={loadPlanes} size="small" />

      <Modal
        title={editingId ? 'Editar Plan' : 'Nuevo Plan'}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={mutationGuardar.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => mutationGuardar.mutate(values)}>
          <Form.Item name="tarjetaId" label="Tarjeta" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children" loading={loadTarjetas}>
              {tarjetas?.map((t: any) => <Option key={t.id} value={t.id}>{t.nombre} ({t.tipo})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="bancoId" label="Banco" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children" loading={loadBancos}>
              {bancos?.map((b: any) => <Option key={b.id} value={b.id}>{b.nombre}</Option>)}
            </Select>
          </Form.Item>
          <Space style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="cantidadCuotas" label="Cant. Cuotas" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} max={48} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="tasaFinanciacion" label="Tasa de Interés (%)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ==========================================
// VISTA PRINCIPAL (Contenedor de Pestañas)
// ==========================================
export const FinanciacionView: React.FC = () => {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Gestión de Financiación</Title>
      
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            key: '1',
            label: <span><PercentageOutlined /> Planes y Cuotas</span>,
            children: <div style={{ padding: '16px', background: '#fff' }}><TabPlanes /></div>,
          },
          {
            key: '2',
            label: <span><CreditCardOutlined /> Tarjetas</span>,
            children: <div style={{ padding: '16px', background: '#fff' }}><TabTarjetas /></div>,
          },
          {
            key: '3',
            label: <span><BankOutlined /> Bancos</span>,
            children: <div style={{ padding: '16px', background: '#fff' }}><TabBancos /></div>,
          }
        ]}
      />
    </div>
  );
};