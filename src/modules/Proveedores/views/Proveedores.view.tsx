import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProveedores, deleteProveedor } from '../services/Proveedores.service';
import type { ColumnsType } from 'antd/es/table';
import type { Proveedor } from '../types/proveedores.type';
import { ProveedoresFormModal } from '../components/PRoveedoresFormModal';

const { Title } = Typography;

export const ProveedoresView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['proveedores'],
        queryFn: getProveedores,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProveedor,
        onSuccess: () => {
            message.success('Proveedor archivado correctamente');
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al archivar el proveedor');
        }
    });

    const handleOpenCreate = () => {
        setProveedorToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (record: Proveedor) => {
        setProveedorToEdit(record);
        setIsModalOpen(true);
    };

    const columns: ColumnsType<Proveedor> = [
        {
            title: 'Razón Social',
            dataIndex: 'razonSocial',
            key: 'razonSocial'
        },
        {
            title: 'CUIT',
            dataIndex: 'cuit',
            key: 'cuit',
            width: 200
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
                        title="¿Eliminar proveedor?"
                        description={`¿Archivar a "${record.razonSocial}"?`}
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
                <Title level={3} style={{ margin: 0 }}>Gestión de Proveedores</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                    Nuevo Proveedor
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={isLoading}
                bordered
            />
            <ProveedoresFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                proveedorToEdit={proveedorToEdit}
            />
        </div>
    );
};