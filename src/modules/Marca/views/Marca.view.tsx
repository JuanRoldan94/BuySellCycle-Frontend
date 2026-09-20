import React, { useState } from 'react';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getMarcas, deleteMarca } from '../services/marca.service';
import type { ColumnsType } from 'antd/es/table';
import type { Marca } from '../types/marca.type';
import { MarcaFormModal } from '../components/MarcaFormModal';

const { Title } = Typography;

export const MarcaView: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [marcaToEdit, setMarcaToEdit] = useState<Marca | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['marcas'],
        queryFn: getMarcas,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMarca,
        onSuccess: () => {
            message.success('Marca archivada correctamente');
            queryClient.invalidateQueries({ queryKey: ['marcas'] });
        },
        onError: (error: any) => {
            const msj = error.response?.data?.message || 'Error al eliminar la marca';
            message.error(msj);
        }
    });

    const handleOpenCreate = () => {
        setMarcaToEdit(null);
        setIsModalOpen(true);
    }

    const handleOpenEdit = (record: Marca) => {
        setMarcaToEdit(record);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMarcaToEdit(null);
    }

    const columns: ColumnsType<Marca> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        style={{ color: '#1890ff' }}
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(record)}
                    />

                    <Popconfirm
                        title="Eliminar Marca?"
                        description={`Estas seguro de archivar "${record.nombre}"?`}
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Si, eliminar"
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
                <Title level={3} style={{ margin: 0 }}>Gestion de Marcas</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                    NuevaMarca
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={isLoading}
                bordered
            />

            <MarcaFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                marcaToEdit={marcaToEdit}
            />

        </div>
    );
};