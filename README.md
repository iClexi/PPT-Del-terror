<div align="center">

# PPT del Terror

### Juego web tipo endless runner con autenticación, rankings, panel administrativo y backend seguro

PPT del Terror es un juego web inspirado en la presión de subir una presentación antes de tiempo.  
El jugador inicia sesión, esquiva obstáculos, recoge archivos PPT, acumula puntuación y compite en rankings semanales e históricos.

</div>

<div align="center">

![React](https://img.shields.io/badge/React-0ea5e9?style=for-the-badge&logo=react&logoColor=ffffff&labelColor=0f172a)
![Vite](https://img.shields.io/badge/Vite-8b5cf6?style=for-the-badge&logo=vite&logoColor=ffffff&labelColor=1e1b4b)
![TypeScript](https://img.shields.io/badge/TypeScript-2563eb?style=for-the-badge&logo=typescript&logoColor=ffffff&labelColor=0f172a)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=ffffff&labelColor=083344)
![Node.js](https://img.shields.io/badge/Node.js-22c55e?style=for-the-badge&logo=nodedotjs&logoColor=ffffff&labelColor=052e16)
![Express](https://img.shields.io/badge/Express-374151?style=for-the-badge&logo=express&logoColor=ffffff&labelColor=030712)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-3b82f6?style=for-the-badge&logo=postgresql&logoColor=ffffff&labelColor=172554)
![Helmet](https://img.shields.io/badge/Helmet-7c3aed?style=for-the-badge&logo=helmet&logoColor=ffffff&labelColor=2e1065)
![bcrypt](https://img.shields.io/badge/bcrypt-f97316?style=for-the-badge&logo=securityscorecard&logoColor=ffffff&labelColor=431407)
![Rate Limiting](https://img.shields.io/badge/Rate_Limiting-dc2626?style=for-the-badge&logo=icloud&logoColor=ffffff&labelColor=450a0a)
![Security](https://img.shields.io/badge/Security_Hardened-10b981?style=for-the-badge&logo=securityscorecard&logoColor=ffffff&labelColor=064e3b)
![Game](https://img.shields.io/badge/Endless_Runner-facc15?style=for-the-badge&logo=gamejolt&logoColor=111827&labelColor=713f12)

</div>

---

## Descripción

PPT del Terror es una aplicación web completa que combina un juego arcade tipo endless runner con autenticación, sesiones, ranking competitivo, almacenamiento en base de datos y panel administrativo.

El proyecto fue desarrollado con React, Vite, TypeScript y Tailwind CSS en el frontend.  
El backend utiliza Node.js, Express, PostgreSQL, Helmet, bcryptjs y express-rate-limit para manejar usuarios, sesiones, puntuaciones, telemetría y controles básicos de seguridad.

La idea principal del juego es sobrevivir a la presión de entregar un PPT antes de que todo salga mal. El jugador controla una nave, evita obstáculos, recoge archivos PPT y trata de conseguir la mejor puntuación posible.

---

## Objetivo del Proyecto

El objetivo de PPT del Terror es demostrar una aplicación web real que combine desarrollo frontend, backend, base de datos, autenticación, seguridad básica y despliegue en producción.

Este proyecto no es solo un juego visual. También incluye una arquitectura funcional con:

- Sistema de usuarios.
- Login y registro.
- Sesiones persistentes.
- Ranking semanal.
- Ranking histórico.
- Panel administrativo.
- Eventos técnicos del juego.
- Base de datos PostgreSQL.
- Protección de rutas sensibles.
- Rate limiting.
- Headers de seguridad.
- Separación de variables sensibles mediante `.env`.

---

## Características Principales

- Juego web tipo endless runner.
- Login y registro de usuarios.
- Sesiones seguras mediante cookie HTTP-only.
- Contraseñas protegidas con bcrypt.
- Ranking semanal.
- Ranking histórico.
- Detección de récord personal.
- Dashboard responsive.
- Panel administrativo para iClexi.
- Registro técnico de tráfico y eventos del juego.
- Soporte para teclado y controles táctiles.
- Validación de usuarios y contraseñas.
- Rate limiting para login y registro.
- Backend conectado a PostgreSQL.
- Headers de seguridad con Helmet.
- Protección básica contra hosts y orígenes no permitidos.
- Variables sensibles fuera del repositorio.

---

## Concepto del Juego

El jugador debe mover una nave para evitar obstáculos relacionados con la presión académica, tareas, errores, notas bajas y el miedo de no subir la presentación a tiempo.

Durante la partida puede recoger archivos PPT para aumentar su progreso de subida.  
Si logra avanzar lo suficiente, consigue subir el PPT.  
Si choca con un obstáculo, reprueba.

---

## Stack Técnico

### Frontend

| Tecnología | Uso |
| --- | --- |
| React | Construcción de interfaz |
| Vite | Entorno de desarrollo y build |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos y diseño responsive |
| Lucide React | Iconos |
| Canvas API | Renderizado y lógica visual del juego |

---

### Backend

| Tecnología | Uso |
| --- | --- |
| Node.js | Runtime del servidor |
| Express | API y servidor backend |
| PostgreSQL | Base de datos |
| pg | Cliente PostgreSQL |
| bcryptjs | Hash de contraseñas |
| Helmet | Headers de seguridad |
| express-rate-limit | Protección contra abuso |
| Crypto nativo de Node.js | Firma y validación de sesión |

---

## Funcionalidades del Juego

- Movimiento con flechas.
- Movimiento con WASD.
- Soporte móvil mediante arrastre táctil.
- Dificultad progresiva.
- Obstáculos generados dinámicamente.
- Coleccionables tipo PPT.
- Frases aleatorias del profesor.
- Sistema de puntuación.
- Pantalla de victoria.
- Pantalla de derrota.
- Popup de nuevo récord personal.
- Registro de partidas.
- Registro de victorias.
- Actualización de mejores puntuaciones.

---

## Sistema de Usuarios

La aplicación incluye autenticación real con base de datos PostgreSQL.

Funciones disponibles:

- Registro de jugador.
- Inicio de sesión.
- Cierre de sesión.
- Persistencia de sesión.
- Validación de sesión activa.
- Diferenciación entre usuario normal y administrador.
- Nombre de jugador único.
- Restricciones de longitud.
- Validación de caracteres permitidos.
- Actualización de último login.
- Hash de contraseña con bcrypt.

---

## Sistema de Rankings

El juego guarda las puntuaciones en PostgreSQL y genera rankings competitivos.

| Ranking | Descripción |
| --- | --- |
| Ranking semanal | Muestra las mejores puntuaciones recientes |
| Ranking histórico | Muestra las mejores puntuaciones de todos los tiempos |

Cada entrada puede mostrar:

- Nombre del jugador.
- Mejor puntuación.
- Cantidad de partidas.
- Victorias.
- Última vez jugado.

---

## Panel Administrativo

El proyecto incluye un panel administrativo reservado para usuarios marcados como administradores.

El panel permite observar:

- Usuarios registrados.
- Último login.
- Mejor puntuación.
- Cantidad de partidas.
- Tráfico reciente.
- Navegador utilizado.
- Plataforma del usuario.
- Viewport.
- Zona horaria.
- Eventos de controles del juego.

El panel está pensado para auditoría técnica y revisión de actividad.  
No registra contraseñas ni campos sensibles.

---

## Seguridad Implementada

PPT del Terror incluye varias medidas de seguridad para proteger sesiones, rutas y datos de usuarios.

### Autenticación

- Registro con contraseña.
- Login con bcrypt.
- Comparación segura de contraseñas.
- Hash dummy para reducir diferencias de tiempo cuando el usuario no existe.
- Sesión firmada con HMAC SHA-256.

### Cookies

- Cookie `HttpOnly`.
- Cookie `Secure` en producción.
- `SameSite=Lax`.
- Expiración configurada.
- Limpieza de cookie al cerrar sesión.

### Protección de API

- Rate limiting general en rutas `/api`.
- Rate limiting más estricto en `/api/login`.
- Rate limiting más estricto en `/api/register`.
- Validación de host permitido.
- Validación de origen para métodos sensibles.
- Control de acceso para rutas administrativas.

### Headers HTTP

- `X-Frame-Options: DENY`.
- `Content-Security-Policy`.
- `frame-ancestors 'none'`.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- `X-Powered-By` desactivado.
- Protección adicional mediante Helmet.

### Datos Sensibles

El repositorio no debe contener:

- Contraseñas reales.
- Tokens reales.
- Secretos de sesión reales.
- Archivos `.env` reales.
- Credenciales de base de datos reales.

---

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`.

```env
PORT=1311
NODE_ENV=production
APP_URL=https://terror.iclexi.tech
ALLOWED_HOSTS=terror.iclexi.tech,localhost,127.0.0.1
COOKIE_SECURE=true
SESSION_SECRET=replace-with-random-hex
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=ppt_terror_db
DB_USER=ppt_terror_user
DB_PASSWORD=replace-with-db-password
DB_SSL=false
ADMIN_PLAYER_NAMES=iClexi
```

---

## Instalación Local

Clona el repositorio:

```bash
git clone https://github.com/iClexi/PPT-Del-terror.git
```

Entra al proyecto:

```bash
cd PPT-Del-terror
```

Instala dependencias:

```bash
npm install
```

Crea el archivo `.env`:

```bash
cp .env.example .env
```

Edita las variables de entorno:

```bash
nano .env
```

---

## Base de Datos PostgreSQL

Crea la base de datos y el usuario para la aplicación:

```bash
sudo -u postgres psql
```

Dentro de PostgreSQL:

```sql
CREATE DATABASE ppt_terror_db;
CREATE USER ppt_terror_user WITH PASSWORD 'replace-with-db-password';
GRANT ALL PRIVILEGES ON DATABASE ppt_terror_db TO ppt_terror_user;
```

Entra a la base de datos:

```sql
\c ppt_terror_db
```

Otorga permisos sobre el esquema público:

```sql
GRANT ALL ON SCHEMA public TO ppt_terror_user;
```

Sal de PostgreSQL:

```sql
\q
```

El servidor crea automáticamente las tablas necesarias al iniciar.

---

## Ejecución en Desarrollo

Ejecuta Vite en modo desarrollo:

```bash
npm run dev
```

---

## Compilación para Producción

Construye el proyecto:

```bash
npm run build
```

Ejecuta el backend con Express:

```bash
npm start
```

Por defecto, el servidor escucha en:

```text
http://localhost:1311
```

---

## Scripts Disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Ejecuta Vite en modo desarrollo |
| `npm run build` | Compila TypeScript y genera el build de Vite |
| `npm start` | Ejecuta el servidor Express |
| `npm run preview` | Previsualiza el build con Vite |
| `npm run check` | Ejecuta verificación de TypeScript sin compilar |

---

## Health Check

El backend incluye una ruta para validar que el servidor y la base de datos están funcionando.

```bash
curl http://localhost:1311/healthz
```

Respuesta esperada:

```json
{
  "ok": true
}
```

---

## Rutas Principales de API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/healthz` | Verifica estado del servidor y conexión a PostgreSQL |
| `GET` | `/api/session` | Valida si existe una sesión activa |
| `POST` | `/api/register` | Registra un nuevo jugador |
| `POST` | `/api/login` | Inicia sesión |
| `POST` | `/api/logout` | Cierra sesión |
| `POST` | `/api/scores` | Guarda puntuación del jugador |
| `POST` | `/api/telemetry` | Guarda eventos técnicos del juego |
| `GET` | `/api/leaderboard` | Devuelve rankings semanal e histórico |
| `GET` | `/api/admin/users` | Lista usuarios para el panel admin |
| `GET` | `/api/admin/traffic` | Lista tráfico reciente |
| `GET` | `/api/admin/users/:id/inputs` | Lista eventos de controles por usuario |

---

## Estructura del Proyecto

```text
.
├── components/
│   ├── AdminPanel.tsx
│   ├── Button.tsx
│   ├── Dashboard.tsx
│   ├── Game.tsx
│   └── Login.tsx
├── public/
├── App.tsx
├── constants.ts
├── index.css
├── index.html
├── index.tsx
├── metadata.json
├── nginx.conf
├── package.json
├── postcss.config.js
├── server.js
├── tailwind.config.js
├── tsconfig.json
├── types.ts
└── vite.config.ts
```

---

## Modelo de Datos

El backend inicializa automáticamente las tablas principales:

| Tabla | Uso |
| --- | --- |
| `ppt_players` | Usuarios, contraseñas hasheadas, rol admin y último login |
| `ppt_scores` | Puntuaciones, victorias, IP de solicitud y fecha |
| `ppt_traffic` | Eventos técnicos, navegador, plataforma, viewport e inputs del juego |

---

## Despliegue en Producción

Flujo recomendado:

```bash
git clone https://github.com/iClexi/PPT-Del-terror.git
cd PPT-Del-terror
npm install
cp .env.example .env
npm run build
npm start
```

---

## Ejemplo con systemd

Crear archivo de servicio:

```bash
sudo nano /etc/systemd/system/ppt-terror.service
```

Contenido recomendado:

```ini
[Unit]
Description=PPT del Terror
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/opt/PPT-Del-terror
EnvironmentFile=/opt/PPT-Del-terror/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Activar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ppt-terror
sudo systemctl start ppt-terror
```

Ver estado:

```bash
systemctl status ppt-terror
```

Ver logs:

```bash
journalctl -u ppt-terror -f
```

---

## Reverse Proxy

En producción se recomienda ejecutar `server.js` detrás de NGINX, Apache o Cloudflare Tunnel.

Flujo recomendado:

```text
Cliente
  -> Dominio público con HTTPS
  -> Reverse proxy o Cloudflare Tunnel
  -> Node.js Express en puerto 1311
  -> PostgreSQL
```

---

## Cloudflare Tunnel

Este proyecto puede publicarse mediante Cloudflare Tunnel apuntando al puerto interno del servidor.

Ejemplo de origen:

```text
http://localhost:1311
```

Ejemplo de dominio:

```text
terror.iclexi.tech
```

En ese caso, la variable `ALLOWED_HOSTS` debe incluir el dominio público:

```env
ALLOWED_HOSTS=terror.iclexi.tech,localhost,127.0.0.1
```

---

## Recomendaciones de Producción

- Usar `COOKIE_SECURE=true`.
- Generar un `SESSION_SECRET` largo y aleatorio.
- No reutilizar contraseñas de base de datos.
- Usar un usuario PostgreSQL dedicado.
- Ejecutar la app detrás de HTTPS.
- Mantener `ALLOWED_HOSTS` limitado.
- No exponer PostgreSQL directamente a internet.
- Ejecutar la app como usuario sin privilegios.
- Mantener Node.js y dependencias actualizadas.
- Revisar logs periódicamente.
- Proteger el panel admin.

---

## Comandos Útiles

Verificar TypeScript:

```bash
npm run check
```

Compilar:

```bash
npm run build
```

Ejecutar:

```bash
npm start
```

Probar health check:

```bash
curl http://localhost:1311/healthz
```

Revisar puerto activo:

```bash
ss -tulpn | grep 1311
```

Probar API de sesión:

```bash
curl -i http://localhost:1311/api/session
```

---

## Estado del Proyecto

El proyecto se encuentra funcional y en evolución.

Actualmente incluye juego, autenticación, rankings, dashboard, panel administrativo, base de datos y controles básicos de seguridad.

---

## Autor

**Michael David Robles Fermin**  
**iClexi**

Proyecto desarrollado como parte de mi portafolio técnico, combinando desarrollo web, backend, base de datos, seguridad y despliegue real.

---

<div align="center">

PPT del Terror  
Un juego web con presión académica, ranking competitivo y backend real.

</div>
