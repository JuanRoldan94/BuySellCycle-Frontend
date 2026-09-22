import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSucursales, deleteSucursal } from '../services/sucursal.service';
import type { ColumnsType } from 'antd/es/table';
import type { Sucursal } from '../types/sucursal.type';
import { SucursalFormModal } from '../components/SucursalFormModal';

const { Title } = Typography;

export const SucursalView: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalToEdit, setSucursalToEdit] = useState<Sucursal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSucursal,
    onSuccess: () => {
      message.success('Sucursal archivada correctamente');
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar');
    }
  });

  const handleOpenCreate = () => { setSucursalToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (record: Sucursal) => { setSucursalToEdit(record); setIsModalOpen(true); };

  const columns: ColumnsType<Sucursal> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Provincia', dataIndex: 'provincia', key: 'provincia' },
    { title: 'Localidad', dataIndex: 'localidad', key: 'localidad' },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" style={{ color: '#1890ff' }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="¿Eliminar sucursal?"
            description={`¿Archivar "${record.nombre}"?`}
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
        <Title level={3} style={{ margin: 0 }}>Gestión de Sucursales</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Nueva Sucursal
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={isLoading} bordered />
      <SucursalFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} sucursalToEdit={sucursalToEdit} />
    </div>
  );
};