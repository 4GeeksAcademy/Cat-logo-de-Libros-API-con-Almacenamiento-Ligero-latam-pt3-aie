# Catálogo de libros

Aplicación full-stack para gestionar un catálogo de libros. El backend es una API REST con FastAPI, TinyDB y JWT; el frontend es una aplicación Next.js con autenticación y vistas según el rol.

## Requisitos

- Python 3.10 o posterior.
- Node.js 20.9 o posterior y npm.

## Backend

1. Crea y activa un entorno virtual, e instala dependencias:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Crea `.env` en la raíz del repositorio. Configura al menos una clave de firma JWT fuerte:

   ```dotenv
   SECRET_KEY=pon-aqui-un-secreto-aleatorio-largo
   ADMIN_EMAIL=admin@ejemplo.com
   FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

   Mantén `.env` fuera del control de versiones. `ADMIN_EMAIL` no crea ni verifica la cuenta: el registro público siempre crea usuarios `user`. Para habilitar el rol admin, registra la cuenta y provisiona manualmente su campo `role` como `admin` en TinyDB (`db.json`); la API solo reconoce ese rol cuando el email coincide con `ADMIN_EMAIL`. Limita el acceso de escritura a la base de datos y no expongas este mecanismo a clientes.

3. (Opcional) Para reemplazar los datos de la base de datos local por los datos iniciales, ejecuta `python seed.py`. Luego inicia el backend:

   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

La API queda disponible en `http://localhost:8000` y su documentación OpenAPI en `/docs`. Se recomienda este puerto para evitar el conflicto con Next.js, que por defecto utiliza `3000`. Alternativamente, `python server.py` inicia el backend en el puerto `3000`; en ese caso debes mover uno de los servidores a otro puerto. `FRONTEND_ORIGINS` es una lista separada por comas de orígenes permitidos, sin rutas.

## Frontend

Con el backend disponible, en otra terminal:

```bash
cd frontend
npm ci
cp .env.local.example .env.local
```

Revisa `frontend/.env.local` y configura la dirección del backend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Después inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:3000`. Si usaste el puerto recomendado `8000` para el backend, los valores por defecto de `NEXT_PUBLIC_API_URL` y `FRONTEND_ORIGINS` quedan alineados.

Comandos de validación del frontend:

```bash
npm run typecheck
npm run build
npm audit --omit=dev
```

## Autenticación y permisos

- `POST /users` registra una cuenta normal; `POST /auth/login` devuelve un token Bearer.
- `GET /auth/me` devuelve la cuenta autenticada y su rol. El frontend persiste el token en `localStorage`.
- Libros: `GET /books` y `GET /books/{book_id}` requieren autenticación; crear, actualizar estado y eliminar requiere `admin`.
- El perfil se consulta y actualiza en `/profile/me`.
- El token expira según `ACCESS_TOKEN_EXPIRE_MINUTES` (30 minutos por defecto); no hay refresh token.

Más detalles de la estructura y decisiones del cliente están en [`Frontend-plan.md`](Frontend-plan.md).
