# ROMI Móvil — Demo básico


- Login: admin/admin
- Tabs: Artículos, Clientes, Estadísticos, Stock
- CRUD completo en Artículos y Clientes con localStorage
- Listado con buscador, toggle de activo y botón eliminar
- Formularios de alta/edición con validaciones mínimas


### Próximos pasos (producción)
1) Reemplazar `services/db.ts` por API REST (Node + Express).
2) Autenticación con JWT y roles (admin, vendedor, etc.).
3) MySQL con migraciones y modelos (Artículos, Clientes, Ventas, Cuotas, Pagos).
4) Estadísticos reales (consultas agregadas) y módulo de Stock.
5) Deploy web (Vercel/Netlify) y mobile (Capacitor: Android/iOS).