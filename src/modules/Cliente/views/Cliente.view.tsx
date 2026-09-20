import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientes, deleteCliente } from '../services/cliente.service';
import type { ColumnsType } from 'antd/es/table';
import type { Cliente } from '../types/cliente.type';
import { ClienteFormModal } from '../components/ClienteFormModal';

const { Title } = Typography;

export const ClienteView: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      message.success('Cliente archivado correctamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar el cliente');
    }
  });

  const handleOpenCreate = () => { setClienteToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (record: Cliente) => { setClienteToEdit(record); setIsModalOpen(true); };

  const columns: ColumnsType<Cliente> = [
    { title: 'Nombre', key: 'nombreCompleto', render: (_, record) => `${record.nombre} ${record.apellido}` },
    { title: 'DNI / CUIT', dataIndex: 'dni', key: 'dni' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" style={{ color: '#1890ff' }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="¿Eliminar cliente?"
            description={`¿Archivar a "${record.nombre} ${record.apellido}"?`}
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Clientes</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Nuevo Cliente
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={isLoading} bordered />
      <ClienteFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clienteToEdit={clienteToEdit} />
    </div>
  );
};