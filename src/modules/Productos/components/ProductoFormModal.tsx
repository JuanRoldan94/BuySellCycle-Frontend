import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Row, Col, Divider } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createProducto, updateProducto } from '../services/producto.service';
import type { Producto } from '../types/producto.type';
import { getMarcas } from '../../Marca/services/marca.service';
import { getJerarquiaCategorias } from '../../Categoria/services/categoria.service';
import { getDepositos } from '../../Deposito/services/deposito.service';

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

  const { data: depositos, isLoading: isLoadingDepositos } = useQuery({
    queryKey: ['depositos'],
    queryFn: getDepositos,
    enabled: isOpen && !productoToEdit, 
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload:any = {
        nombre: values.nombre,
        marcaId: Number(values.marcaId),
        categoriaNivel2Id: Number(values.categoriaNivel2Id),
        costoNeto: Number(values.costoNeto),
        utilidadPorcentaje: Number(values.utilidadPorcentaje),
        porcentajeDescuentoContado: Number(values.porcentajeDescuentoContado)
      };

      if (values.depositoId) {
        payload.depositoId = Number(values.depositoId);
      }
      if (values.stockInicial) {
        payload.stockInicial = Number(values.stockInicial);
      }

      if (productoToEdit) {
        updateMutation.mutate({ id: productoToEdit.id, data: payload });
      } else {
        createMutation.mutate(payload);
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

        {!productoToEdit && (
          <>
            <Divider>Stock Inicial (Opcional)</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="depositoId" label="Depósito Inicial">
                  <Select placeholder="Seleccione un depósito" loading={isLoadingDepositos} allowClear>
                    {depositos?.map((d: any) => (
                      <Select.Option key={d.id} value={d.id}>{d.nombre}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="stockInicial" label="Cantidad Inicial">
                  <InputNumber 
                    min={1} 
                    style={{ width: '100%' }} 
                    placeholder="Ej: 50" 
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="nombre"
              label="Nombre del producto"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Input placeholder="Ej: Bicicleta Mountain Bike R29" autoFocus />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
                {marcas?.map((marca: any) => (
                  <Select.Option key={marca.id} value={marca.id}>{marca.nombre}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
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
                {categorias?.map((catN1: any) => (
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
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="costoNeto"
              label="Costo Neto ($)"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0} 
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="utilidadPorcentaje"
              label="Utilidad (%)"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                formatter={value => `${value}%`}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="porcentajeDescuentoContado"
              label="Desc. Contado (%)"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                max={100}
                formatter={value => `${value}%`}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};