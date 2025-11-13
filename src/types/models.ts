export interface Articulo {
    id: string; // uuid
    codigointerno: string;
    ean?: string;
    descripcion: string;
    preciocosto: number;
    precioventa: number;
    stock?: number;
    activo: boolean;
    creadoEl: string; // ISO
    }
    
    
    export interface Cliente {
    id: string; // uuid
    nombre: string;
    email?: string;
    telefono?: string;
    activo: boolean;
    creadoEl: string; // ISO
    }