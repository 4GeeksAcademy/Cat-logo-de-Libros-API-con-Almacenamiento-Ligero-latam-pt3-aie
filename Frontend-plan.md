# Plan técnico de frontend — Catálogo de libros

## 1. Objetivo y alcance

Construir una aplicación responsive con TypeScript, Next.js usando **Pages Router** (sin `src/`) y Tailwind CSS. El cliente consume la API FastAPI existente; no reemplaza ni duplica la lógica de autenticación/autorización del servidor. La prioridad es implementar correctamente registro, inicio/cierre de sesión, persistencia y rutas protegidas.

El plan contempla una fase previa de ajustes al backend para roles y autorización de administración. No se debe presentar la protección visual del frontend como control de seguridad: la API debe validar cada operación privilegiada.

## 2. Stack y convenciones

- Next.js con Pages Router y TypeScript.
- Tailwind CSS para estilos; diseño mobile-first y responsive.
- Formularios con validación cliente alineada a las reglas Pydantic del backend. Evitar inventar reglas de negocio adicionales.
- Componentes reutilizables tipados; llamadas HTTP centralizadas en `fetchApi`.
- Los errores de API se muestran junto al formulario o en un estado de página comprensible; no exponer detalles técnicos internos.

## 3. Estructura de archivos objetivo

```text
frontend/
├── components/
│   ├── AppLayout.tsx
│   ├── Navbar.tsx
│   ├── AuthGuard.tsx
│   ├── GuestGuard.tsx
│   ├── FormField.tsx
│   ├── FeedbackMessage.tsx
│   └── books/
│       ├── BookList.tsx
│       └── BookCard.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useProtectedPage.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── routes.ts
│   └── validation.ts
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── 404.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── books/
│   │   └── index.tsx
│   ├── profile/
│   │   └── index.tsx
│   └── admin/
│       └── index.tsx
├── styles/
│   └── globals.css
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── book.ts
│   ├── profile.ts
│   └── user.ts
├── .env.local.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

Responsabilidades principales:

- `context/AuthContext.tsx`: estado global `loading/authenticated/unauthenticated`, usuario actual, login, registro, logout e inicialización de sesión.
- `lib/api.ts`: `fetchApi`, URL base, serialización JSON, Bearer token, manejo de respuestas vacías y errores normalizados.
- `lib/auth.ts`: lectura/escritura/eliminación del token en `localStorage`, con guardas para renderizado SSR.
- `AuthGuard` y `GuestGuard`: control de navegación después de hidratar la sesión, sin parpadeos de contenido privado.
- `types/`: contratos del API escritos explícitamente, incluidos los campos de respuesta y payload.

## 4. Contrato de integración con la API existente

Base URL configurable con `NEXT_PUBLIC_API_URL` (documentar el valor local en `.env.local.example`). `fetchApi` debe enviar `Content-Type: application/json` cuando exista body JSON, añadir `Authorization: Bearer <access_token>` para llamadas autenticadas y convertir respuestas no exitosas en errores de aplicación con status y mensaje útil. Debe soportar respuestas `204 No Content` sin intentar parsear JSON.

Endpoints verificados en el backend actual:

| Operación | Método y ruta | Acceso actual | Contrato relevante |
|---|---|---|---|
| Registro | `POST /users` | Público | `{ username, email, password }` → usuario `{ id, username, email }`; `201`. No inicia sesión ni devuelve token. |
| Login | `POST /auth/login` | Público | `{ email, password }` → `{ access_token, token_type }`; credenciales inválidas: `401`. |
| Usuario/perfil actual | `GET /auth/me` | Bearer | `{ email, profile }`; sirve para recuperar usuario y perfil al inicializar sesión. |
| Ver perfil | `GET /profile/me` | Bearer | Devuelve perfil con `id`, `user_id`, `full_name`, `bio`, `phone`, `address`. |
| Actualizar perfil | `PUT /profile/me` | Bearer | `{ full_name, phone, address }`; validaciones de backend: nombre 1–100, teléfono opcional hasta 30, dirección opcional hasta 250. |
| Listar libros | `GET /books` | Público hoy | Devuelve lista de libros. La UI exigirá sesión según la decisión de producto, hasta que se revise esa política. |
| Detalle de libro | `GET /books/{book_id}` | Público hoy | Devuelve libro o `404`. |
| Crear libro | `POST /books` | Público hoy | `{ title, author, genre, pages, status }`; solo habilitar tras implementar autorización backend. |
| Cambiar estado | `PATCH /books/{book_id}/status` | Público hoy | `{ status }`; solo habilitar tras implementar autorización backend. |
| Eliminar libro | `DELETE /books/{book_id}` | Público hoy | Respuesta `204`; solo habilitar tras implementar autorización backend. |

Login exitoso navega a `/profile`. Registro exitoso muestra confirmación y navega a `/login`, ya que `POST /users` no entrega token. La respuesta actual de login solo incluye token; para conocer el rol y refrescar el estado de sesión, consultar `GET /auth/me`.

## 5. Autenticación y protección de rutas (prioridad)

1. Al cargar la app, esperar al cliente y leer el token de `localStorage`; si existe, llamar `GET /auth/me` para comprobarlo y poblar el estado autenticado. Mientras se comprueba, mostrar estado de carga y no renderizar datos privados.
2. En login, validar email y contraseña, llamar `POST /auth/login`, guardar `access_token`, luego obtener el perfil/usuario actual y navegar a `/profile`. Si falla la carga del usuario después del login, limpiar el token y presentar error recuperable.
3. En registro, validar `username` (1–50), email y contraseña (mínimo 8), enviar `POST /users`; manejar `409` por nombre/email ya registrado; al éxito, ir a `/login` sin guardar sesión.
4. En logout, eliminar token y estado de usuario de memoria, y navegar a `/`.
5. Las páginas `/books` y `/profile` requieren sesión en la interfaz. `/admin` requiere sesión y rol admin. Las páginas `/login` y `/signup` son para visitantes; si ya hay sesión, redirigir a `/profile`.
6. Si cualquier llamada autenticada devuelve `401`, invalidar la sesión, eliminar el token y redirigir a `/login` (preservar opcionalmente la ruta de retorno solo si se acuerda más adelante; por ahora no se añade).
7. No leer `localStorage` durante render del servidor. Usar `useEffect`/context y guards compatibles con SSR para evitar errores de hidratación.
8. El token de acceso expira a los 30 minutos en configuración actual del backend. No hay endpoint de refresh; al recibir `401`, volver a autenticar.

### Consideración de seguridad

`localStorage` es la decisión actual solicitada, pero un token accesible a JavaScript aumenta el impacto de XSS. Mitigar con renderizado seguro, no insertar HTML no confiable y mantener dependencias/componentes confiables. La alternativa de cookie `HttpOnly`, `Secure`, `SameSite` requeriría cambios backend y queda fuera de este plan aprobado.

## 6. Páginas y navegación

- `/`: inicio para administración de la librería. Presenta un encabezado/resumen de libros; el área y acciones administrativas solo aparecen para rol `admin` y una vez implementados los permisos backend. No inferir que la API actual está protegida.
- `/books`: listado de libros para usuario autenticado. Con backend actual, el endpoint es público; el guard es una restricción de navegación del cliente y debe alinearse con backend antes de considerar el acceso realmente privado.
- `/login`: formulario de email y contraseña, validación de campos, estados de envío y errores de credenciales.
- `/signup`: formulario de username, email y contraseña, validación, errores de conflicto y confirmación de registro.
- `/profile`: requiere sesión; cargar perfil, mostrar datos y permitir editar mediante `PUT /profile/me` con validación alineada al esquema. Mostrar estado de carga, error y confirmación de guardado.
- `/admin`: panel de administración de libros protegido por rol, para crear, actualizar estado y eliminar. No habilitar acciones hasta que la API valide admin.

La barra de navegación contiene logo/título, enlace a libros, enlaces a login y registro solo para visitantes, perfil y logout solo para usuarios autenticados, y entrada al panel admin solo para admin. Los elementos deben funcionar con teclado y tener estados accesibles.

## 7. Roles y fase de ajuste del backend (requisito previo a administración)

El backend actual **no implementa roles**. El registro público crea usuarios sin rol, `GET /auth/me` no devuelve rol, y las operaciones para crear, cambiar estado y borrar libros no requieren autenticación. Por tanto, no se debe dar por hecho que la UI puede administrar acceso de forma segura.

Antes de habilitar la administración:

1. Definir/guardar un rol de usuario con valores `user` o `admin`; todo registro público queda como `user`. No permitir asignación de `admin` desde `/signup`.
2. Incluir el rol en la respuesta de `GET /auth/me` para construir el estado de UI.
3. Añadir autorización en servidor: `admin` puede crear, modificar estado y borrar libros; `user` autenticado puede listar y consultar libros. Proteger además los endpoints de listado/detalle para que la regla de acceso no dependa del guard frontend.
4. Responder `401` sin credenciales válidas y `403` con sesión válida pero permisos insuficientes.
5. Provisionar el admin manualmente en TinyDB por el operador (`role: admin`) y fijar su email en `ADMIN_EMAIL`, configurado solo en el entorno backend. El registro público siempre crea `user`; el backend solo honra el rol admin provisionado si coincide con la allowlist. Nunca exponer la variable ni una selección de rol desde el frontend.

## 8. Validación funcional de formularios

- Login: email obligatorio y contraseña obligatoria. El backend recibe email como texto (no valida formato email formalmente); el formulario puede aplicar formato email básico y mostrar los errores API sin revelar si existe una cuenta.
- Signup: `username` 1–50 caracteres, email 3–254, contraseña mínimo 8. El backend devuelve `409` si username o email ya están usados.
- Perfil: `full_name` 1–100; `phone` opcional hasta 30; `address` opcional hasta 250. `bio` se muestra si viene en el perfil, pero no se envía en el `PUT` actual porque `ProfileUpdate` no lo admite.
- No almacenar ni registrar contraseñas en logs o estado persistente.

## 9. Secuencia técnica de implementación

1. Crear la app Next.js en `frontend/` con TypeScript, Pages Router y Tailwind; verificar configuración y responsive base.
2. Modelar los tipos del contrato actual y construir `fetchApi` usando `NEXT_PUBLIC_API_URL`.
3. Implementar almacenamiento de token, `AuthContext`, inicialización con `GET /auth/me`, login, signup y logout.
4. Implementar guards SSR-safe y navegación condicional; validar expiración/`401` y limpieza de sesión.
5. Construir páginas de autenticación y perfil, incluidas validaciones, errores, carga y éxito.
6. Construir catálogo/listado de libros detrás del guard de interfaz decidido.
7. Coordinar la fase de roles y permisos backend descrita arriba; hasta entonces mantener deshabilitadas las mutaciones administrativas.
8. Con el contrato ampliado, agregar `/admin`, controles por rol y consumo de mutaciones, dejando al backend como autoridad de permisos.

## 10. Decisiones confirmadas y límites

- Persistencia de token: `localStorage`.
- Ruta tras login: `/profile`.
- `401` autenticado: limpiar token/estado y redirigir a `/login`.
- Roles objetivo: `user` / `admin`; registro público siempre crea `user`.
- `/books` exige autenticación en la navegación del frontend, aunque el endpoint es público hoy.
- Logout elimina el token y redirige a `/`.
- Signup exitoso redirige a `/login`.
- Permisos objetivo: `admin` gestiona libros (CRUD); `user` autenticado solo consulta libros.
- No se especifican diseño visual detallado, contenido/identidad gráfica, despliegue, ni estrategia de pruebas; no se agregan como alcance aprobado. El provisioning de admin se acordó manual en TinyDB, restringido por `ADMIN_EMAIL`.


