import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepositos, deleteDeposito } from '../services/deposito.service';
import type { ColumnsType } from 'antd/es/table';
import { DepositoFormModal } from '../components/DepositoFormModal';

const { Title } = Typography;

interface Deposito {
  id: number;
  codigo?: string;
  nombre: string;
  provinciaId: number;
  localidadId: number;
  provincia?: { nombre: string };
  localidad?: { nombre: string };
}

export const DepositoView: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositoToEdit, setDepositoToEdit] = useState<Deposito | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['depositos'],
    queryFn: getDepositos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeposito,
    onSuccess: () => {
      message.success('Depósito archivado correctamente');
      queryClient.invalidateQueries({ queryKey: ['depositos'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al archivar el depósito');
    }
  });

  const handleOpenCreate = () => { 
    setDepositoToEdit(null); 
    setIsModalOpen(true); 
  };
  
  const handleOpenEdit = (record: Deposito) => { 
    setDepositoToEdit(record); 
    setIsModalOpen(true); 
  };

  const columns: ColumnsType<Deposito> = [
    { title: 'Código', dataIndex: 'codigo', key: 'codigo', width: 120 },
    { title: 'Nombre del Depósito', dataIndex: 'nombre', key: 'nombre' },
    { 
      title: 'Provincia', 
      key: 'provincia', 
      render: (_, record) => record.provincia?.nombre || 'N/A'
    },
    { 
      title: 'Localidad', 
      key: 'localidad', 
      render: (_, record) => record.localidad?.nombre || 'N/A'
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" style={{ color: '#1890ff' }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="¿Eliminar depósito?"
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
        <Title level={3} style={{ margin: 0 }}>Gestión de Depósitos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Nuevo Depósito
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={isLoading} 
        bordered 
      />
      <DepositoFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        depositoToEdit={depositoToEdit} 
      />
    </div>
  );
};