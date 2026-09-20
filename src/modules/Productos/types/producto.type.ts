export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precioLista: number;
    precioContado: number;
    stockTotal: number;
    marcaId: number;
    categoriaNivel2Id: number;
    archivado: boolean;

    marca?: { id: number; nombre: string };
    categoriaNivel2?: { id: number; nombre: string };
}