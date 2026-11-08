import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientes, deleteCliente } from '../services/cliente.service';
import type { ColumnsType } from 'antd/es/table';
import type { Cliente } from '../types/cliente.type';
import { ClienteFormModal } from '../components/ClienteFormModal';
import { DireccionesClienteModal } from '../components/DireccionesClienteModal';

const { Title } = Typography;

export const ClienteView: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteDirecciones, setClienteDirecciones] = useState<Cliente | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      message.success('Cliente eliminado correctamente');
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
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Dirección Principal',
      key: 'direccionPrincipal',
      render: (_, record) => {
        const principal = record.direccionEntregas?.find(d => d.principal) || record.direccionEntregas?.[0];
        return principal ? (
          <Space>
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            <span>{principal.direccion}</span>
          </Space>
        ) : (
          <span style={{ color: '#bfbfbf' }}>Sin direcciones</span>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={`Gestionar Direcciones (${record.direccionEntregas?.length || 0})`}>
            <Button 
              type="text" 
              style={{ color: '#52c41a' }} 
              icon={<EnvironmentOutlined />} 
              onClick={() => setClienteDirecciones(record)} 
            />
          </Tooltip>
          <Tooltip title="Editar Cliente">
            <Button 
              type="text" 
              style={{ color: '#1890ff' }} 
              icon={<EditOutlined />} 
              onClick={() => handleOpenEdit(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar cliente?"
            description={`¿Desea eliminar a "${record.nombre} ${record.apellido}"?`}
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar Cliente">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
      <DireccionesClienteModal 
        isOpen={!!clienteDirecciones} 
        onClose={() => setClienteDirecciones(null)} 
        cliente={clienteDirecciones} 
      />
    </div>
  );
};
