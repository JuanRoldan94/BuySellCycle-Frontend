import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductos, deleteProducto } from '../services/producto.service';
import type { ColumnsType } from 'antd/es/table';
import type { Producto } from '../types/producto.type';
import { ProductoFormModal } from '../components/ProductoFormModal';

const { Title } = Typography;

export const ProductoView: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      message.success('Producto archivado correctamente');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar el producto');
    }
  });

    const handleOpenCreate = () => {
    setProductoToEdit(null);
    setIsModalOpen(true);
    };

    const handleOpenEdit = (record: Producto) => {
    setProductoToEdit(record);
    setIsModalOpen(true);
  };

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
  };

  const columns: ColumnsType<Producto> = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { 
      title: 'Marca', 
      key: 'marca', 
      render: (_, record) => record.marca?.nombre || 'Sin marca' 
    },
    { 
      title: 'Categoría', 
      key: 'categoria', 
      render: (_, record) => record.categoriaNivel2?.nombre || 'Sin categoría' 
    },
    { 
      title: 'Precio Lista', 
      dataIndex: 'precioLista', 
      key: 'precioLista',
      align: 'right',
      render: (monto) => formatearDinero(monto)
    },
    { 
      title: 'Stock', 
      dataIndex: 'stockTotal', 
      key: 'stockTotal',
      align: 'center',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'warning' : 'error'}>
          {stock} un.
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            style={{ color: '#1890ff' }} 
            icon={<EditOutlined />} 
            onClick={() => handleOpenEdit(record)}
          />
          
          <Popconfirm
            title="¿Eliminar producto?"
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
        <Title level={3} style={{ margin: 0 }}>Catálogo de Productos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Nuevo Producto
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={isLoading} 
        bordered
        scroll={{ x: 1000 }}
      />

      <ProductoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productoToEdit={productoToEdit}
      />
    </div>
  );
};