export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  sucursalId: number;
  archivado: boolean;

  sucursal?: { id: number; nombre: string };
}
