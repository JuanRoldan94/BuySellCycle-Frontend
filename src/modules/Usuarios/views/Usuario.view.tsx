import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarios, deleteUsuario } from '../services/usuario.service';
import type { ColumnsType } from 'antd/es/table';
import type { Usuario } from '../types/usuario.type';
import { UsuarioFormModal } from '../components/UsuarioFormModal';

const { Title } = Typography;

export const UsuarioView: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      message.success('Usuario archivado correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar');
    }
  });

  const handleOpenCreate = () => { setUsuarioToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (record: Usuario) => { setUsuarioToEdit(record); setIsModalOpen(true); };

  const columns: ColumnsType<Usuario> = [
    {
      title: 'Nombre',
      key: 'nombreCompleto',
      render: (_, record) => `${record.nombre} ${record.apellido}`
    },
    {
      title: 'Nombre de usuario',
      dataIndex: 'nombreUsuario',
      key: 'nombreUsuario'
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol) => <Tag color={rol === 'Administracion' ? 'red' : 'blue'}>{rol}</Tag>
    },
    {
      title: 'Sucursal',
      key: 'sucursal',
      render: (_, record) => record.sucursal?.nombre || 'Sin asignar'
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" style={{ color: '#1890ff' }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="¿Eliminar usuario?"
            description={`¿Archivar a "${record.nombre}"?`}
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
        <Title level={3} style={{ margin: 0 }}>Gestión de Usuarios</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Nuevo Usuario
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={isLoading} bordered />
      <UsuarioFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} usuarioToEdit={usuarioToEdit} />
    </div>
  );
};