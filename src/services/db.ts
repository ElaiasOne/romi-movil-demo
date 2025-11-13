import type { Articulo, Cliente } from '@/types/models';


const A_KEY = 'romi_articulos';
const C_KEY = 'romi_clientes';


function uuid() {
return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}


function getList<T>(key: string): T[] {
try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function setList<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }


// Artículos
export const articulos = {
list(): Articulo[] { return getList<Articulo>(A_KEY); },
create(data: Omit<Articulo,'id'|'creadoEl'>): Articulo {
const item: Articulo = { id: uuid(), creadoEl: new Date().toISOString(), ...data };
const arr = getList<Articulo>(A_KEY); arr.unshift(item); setList(A_KEY, arr); return item;
},
update(id: string, patch: Partial<Articulo>): Articulo | null {
const arr = getList<Articulo>(A_KEY);
const i = arr.findIndex(a => a.id === id);
if (i === -1) return null;
arr[i] = { ...arr[i], ...patch };
setList(A_KEY, arr);
return arr[i];
},
remove(id: string) {
const arr = getList<Articulo>(A_KEY).filter(a => a.id !== id);
setList(A_KEY, arr);
}
};


// Clientes
export const clientes = {
list(): Cliente[] { return getList<Cliente>(C_KEY); },
create(data: Omit<Cliente,'id'|'creadoEl'>): Cliente {
const item: Cliente = { id: uuid(), creadoEl: new Date().toISOString(), ...data };
const arr = getList<Cliente>(C_KEY); arr.unshift(item); setList(C_KEY, arr); return item;
},
update(id: string, patch: Partial<Cliente>): Cliente | null {
const arr = getList<Cliente>(C_KEY);
const i = arr.findIndex(a => a.id === id);
if (i === -1) return null;
arr[i] = { ...arr[i], ...patch };
setList(C_KEY, arr);
return arr[i];
},
remove(id: string) {
const arr = getList<Cliente>(C_KEY).filter(a => a.id !== id);
setList(C_KEY, arr);
}
};