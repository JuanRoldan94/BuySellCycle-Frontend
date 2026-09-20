import React, { useState } from 'react';
import { Table, Button, Space, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, TagOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJerarquiaCategorias, deleteCategoriaNivel1, deleteCategoriaNivel2 } from '../services/categoria.service';
import type { ColumnsType } from 'antd/es/table';
import type { CategoriaNivel1 } from '../types/categoria.type';
import type { CategoriaNivel2 } from '../types/categoria.type';
import { CategoriaNivel1FormModal } from '../components/CategoriaNivel1FormModal';
import { CategoriaNivel2FormModal } from '../components/CategoriaNivel2FormModal';

const { Title } = Typography;

export const CategoriaView: React.FC = () => {
    const queryClient = useQueryClient();

    const [isModalN1Open, setIsModalN1Open] = useState(false);
    const [categoriaN1ToEdit, setCategoriaN1ToEdit] = useState<CategoriaNivel1 | null>(null);

    const [isModalN2Open, setIsModalN2Open] = useState(false);
    const [categoriaN2ToEdit, setCategoriaN2ToEdit] = useState<CategoriaNivel2 | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['categorias-jerarquia'],
        queryFn: getJerarquiaCategorias,
    });

    const deleteN1Mutation = useMutation({
        mutationFn: deleteCategoriaNivel1,
        onSuccess: () => {
            message.success('Categoría archivada correctamente');
            queryClient.invalidateQueries({ queryKey: ['categorias-jerarquia'] });
        },
            onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al eliminar la categoría');
        }
    });

    const deleteN2Mutation = useMutation({
        mutationFn: deleteCategoriaNivel2,
        onSuccess: () => {
            message.success('Sub-categoría archivada correctamente');
            queryClient.invalidateQueries({ queryKey: ['categorias-jerarquia'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al eliminar la sub-categoría');
        }
    });

    const handleOpenCreateN1 = () => {
        setCategoriaN1ToEdit(null);
        setIsModalN1Open(true);
    };

    const handleOpenEditN1 = (record: any) => {
        setCategoriaN1ToEdit(record);
        setIsModalN1Open(true);
    };

    const handleOpenCreateN2 = () => {
        setCategoriaN2ToEdit(null);
        setIsModalN2Open(true);
    }

    const handleOpenEditN2 = (record: any) => {
        setCategoriaN2ToEdit(record);
        setIsModalN2Open(true);
    }

    const columns: ColumnsType<any> = [
        { 
            title: 'Nombre', 
            dataIndex: 'nombre', 
            key: 'nombre',
            render: (text, record) => (
                <Space>
                {record.isNivel2 ? <TagOutlined style={{ color: '#8c8c8c' }} /> : <FolderOutlined style={{ color: '#1890ff' }} />}
                <strong>{text}</strong>
                </Space>
            )
        },
        {
            title: 'Nivel',
            key: 'nivel',
            width: 150,
            render: (_, record) => (
                record.isNivel2 
                ? <Tag color="default">Nivel 2 (Sub)</Tag> 
                : <Tag color="blue">Nivel 1 (Padre)</Tag>
            )
        },
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
                    onClick={() => {
                    if (record.isNivel2) {
                        handleOpenEditN2(record);
                    } else {
                        handleOpenEditN1(record);
                    }
                    }}
                />
                    <Popconfirm
                        title={`¿Eliminar ${record.isNivel2 ? 'sub-categoría' : 'categoría'}?`}
                        description={`¿Estás seguro de archivar "${record.nombre}"?`}
                        onConfirm={() => {
                        if (record.isNivel2) {
                            deleteN2Mutation.mutate(record.id);
                        } else {
                            deleteN1Mutation.mutate(record.id);
                        }
                        }}
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
                <Title level={3} style={{ margin: 0 }}>Gestión de Categorías</Title>
                <Space>
                    <Button icon={<PlusOutlined />} onClick={handleOpenCreateN2}>Nuevo Sub-nivel (N2)</Button>

                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateN1}>
                        Nueva Categoría (N1)
                    </Button>
                </Space>
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey={(record) => record.isNivel2 ? `n2-${record.id}` : `n1-${record.id}`} 
                loading={isLoading} 
                bordered
                pagination={false}
            />

            <CategoriaNivel1FormModal 
                isOpen={isModalN1Open}
                onClose={() => setIsModalN1Open(false)}
                categoriaToEdit={categoriaN1ToEdit}
            />

            <CategoriaNivel2FormModal
                isOpen={isModalN2Open}
                onClose={() => setIsModalN2Open(false)}
                categoriaToEdit={categoriaN2ToEdit}
                categoriasPadre = {data || []}
            />
        </div>
    );
};