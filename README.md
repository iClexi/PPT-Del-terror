# PPT del Terror

Juego web de "PPT del Terror" con login real, sesiones seguras y dashboard de rankings semanal/global sobre PostgreSQL.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Express
- PostgreSQL

## Desarrollo

```bash
npm install
npm run dev
```

## Backend

El backend sirve `dist/` y expone:

- `POST /api/login`
- `POST /api/logout`
- `GET /api/session`
- `POST /api/scores`
- `GET /api/leaderboard`
- `GET /healthz`

## Variables de entorno

Copiar `.env.example` y configurar valores reales fuera del repositorio:

```bash
cp .env.example .env
```

`LOGIN_PASSWORD_HASH` debe ser un hash bcrypt. Ejemplo:

```bash
LOGIN_PASSWORD='tu-password' node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash(process.env.LOGIN_PASSWORD, 12));"
```

## Produccion

```bash
npm run build
npm run start
```

Por defecto escucha en el puerto `1311`.
