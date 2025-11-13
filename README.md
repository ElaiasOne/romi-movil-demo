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


### STACK UTILIZADO

Ionic → ofrece una interfaz similar a una app nativa, ideal para usar en celular.

Vue → framework rápido y liviano para que la app funcione fluida.

Vite → herramienta que optimiza y acelera la carga final de la aplicación.

Pinia → maneja datos internos de la app (usuario logueado, información temporal).

Capacitor → permite convertir esta misma app en un APK para Android, sin rehacer nada.

Vercel → hosting donde está subida la demo, accesible 24/7 y muy rápida.

Todo esto hace que la app sea rápida, moderna, funcione en cualquier dispositivo y esté lista para conectarse a un backend real (Node.js + MySQL) cuando se necesite.