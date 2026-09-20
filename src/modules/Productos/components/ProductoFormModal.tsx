import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Row, Col } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createProducto, updateProducto } from '../services/producto.service';
import type { Producto } from '../types/producto.type';

// Importamos los servicios de los otros módulos para poblar los selectores
import { getMarcas } from '../../Marca/services/marca.service';
import { getJerarquiaCategorias } from '../../Categoria/services/categoria.service';

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoToEdit?: Producto | null;
}

export const ProductoFormModal: React.FC<ProductoFormModalProps> = ({ 
  isOpen, 
  onClose, 
  productoToEdit 
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: marcas, isLoading: isLoadingMarcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: getMarcas,
    enabled: isOpen,
  });

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias-jerarquia'],
    queryFn: getJerarquiaCategorias,
    enabled: isOpen,
  });

  useEffect(() => {
    if (productoToEdit && isOpen) {
      form.setFieldsValue(productoToEdit);
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [productoToEdit, isOpen, form]);

  const createMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      message.success('Producto creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear el producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProducto(id, data),
    onSuccess: () => {
      message.success('Producto actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar el producto');
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (productoToEdit) {
        updateMutation.mutate({ id: productoToEdit.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  return (
    <Modal
      title={productoToEdit ? "Editar Producto" : "Nuevo Producto"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
      width={700} 
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nombre"
              label="Nombre del producto"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Input placeholder="Ej: Bicicleta Mountain Bike R29" autoFocus />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="marcaId"
              label="Marca"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select 
                placeholder="Seleccione marca" 
                loading={isLoadingMarcas}
                showSearch
                optionFilterProp="children"
              >
                {marcas?.map(marca => (
                  <Select.Option key={marca.id} value={marca.id}>{marca.nombre}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoriaNivel2Id"
              label="Categoría"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Select 
                placeholder="Seleccione categoría" 
                loading={isLoadingCategorias}
                showSearch
              >
                {categorias?.map(catN1 => (
                  <Select.OptGroup key={`g-${catN1.id}`} label={catN1.nombre}>
                    {catN1.children?.map((catN2: any) => (
                      <Select.Option key={catN2.id} value={catN2.id}>
                        {catN2.nombre}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="stockTotal"
              label="Stock Inicial"
              rules={[{ required: true, message: 'Requerido' }]}
              tooltip={productoToEdit ? "El stock solo se modifica desde Movimientos" : ""}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0} 
                disabled={!!productoToEdit} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="precioLista"
              label="Precio de Lista ($)"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0} 
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="precioContado"
              label="Precio Contado ($)"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="descripcion"
          label="Descripción (Opcional)"
        >
          <Input.TextArea rows={3} placeholder="Detalles técnicos, colores disponibles..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};