export interface CategoriaNivel2 {
  id: number;
  nombre: string;
  categoriaNivel1Id: number;
  archivado: boolean;
  isNivel2?: boolean;
}

export interface CategoriaNivel1 {
  id: number;
  nombre: string;
  archivado: boolean;
  categoriasNivel2: CategoriaNivel2[];
  children?: CategoriaNivel2[]; 
}