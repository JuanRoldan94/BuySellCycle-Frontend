export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
    dni: string;
    archivado: boolean;
}