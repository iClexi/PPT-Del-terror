# PPT del Terror

PPT del Terror es un juego web tipo endless runner inspirado en la presión de subir una presentación antes de tiempo. El jugador inicia sesión, juega desde teclado o móvil, acumula puntuación y compite en rankings semanales y globales.

## Qué Ofrece

- Login y registro con sesiones seguras.
- Juego infinito con dificultad progresiva.
- Controles con flechas, WASD y arrastre táctil en móvil.
- Ranking semanal y ranking histórico sobre PostgreSQL.
- Popup de nuevo récord personal.
- Dashboard responsive para ver puntuaciones sin scroll horizontal innecesario.
- Panel admin para iClexi con tráfico técnico, usuarios, navegador y eventos de control del juego.
- Rate limiting en login y registro.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Express
- PostgreSQL
- Helmet
- bcrypt

## Seguridad y Transparencia

El repositorio publica el código fuente de la página, no secretos. Los archivos `.env` reales están ignorados por Git y las variables sensibles deben vivir en el servidor, fuera del commit.
