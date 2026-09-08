# Cuartel del Músico — Streaming + Gestión

Plataforma para la sala de ensayo **Cuartel del Músico** (Concepción). Dos partes en un solo proyecto:

1. **Sitio público** (`/`, `/agenda`): streaming embebido (YouTube) + agenda de bandas.
2. **Panel de gestión** (`/panel`, requiere login): reservas de sala, bandas/clientes, inventario de equipos y cobros.

## Fases del streaming

- **Fase 1 (actual):** modo `playlist` — se muestra una lista de reproducción de YouTube con sesiones grabadas, mientras se arma el streaming en vivo físico (cámara + audio + OBS en la sala).
- **Fase 2:** modo `live` — se cambia a un video/transmisión en vivo de YouTube. El cambio se hace desde `/panel/streaming`, sin tocar código.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (fácil de migrar a Postgres para producción)
- NextAuth (credenciales) protegiendo `/panel` vía `src/proxy.ts`

## Primeros pasos

```bash
npm install
npm run db:seed   # crea el usuario admin y datos de ejemplo
npm run dev        # http://localhost:3000
```

**Usuario admin de partida** (cámbialo apenas entres, no hay pantalla de "cambiar contraseña" todavía — se actualiza directo en la base o se re-corre el seed con otra clave):

```
admin@cuarteldelmusico.cl / cambiar123
```

## Comandos útiles

- `npm run db:studio` — explorador visual de la base de datos (Prisma Studio).
- `npx prisma migrate dev --name <cambio>` — crear una migración después de editar `prisma/schema.prisma`.

## Producción / deploy

El build de producción usa `output: "standalone"` (ver `next.config.ts`) —
pensado para el hosting Node.js de Hostinger (CloudLinux Node.js Selector /
Passenger), mismo hosting que otros sitios de esta cuenta. Ver
[deploy.sh](deploy.sh) para el script de despliegue (todavía no probado
contra el servidor real — faltan un par de datos que solo se conocen una
vez creada la app en hPanel, marcados como `TODO` ahí mismo).

**Variables de entorno que tiene que tener el `.env` de producción**
(se crea una sola vez a mano por SSH; el deploy nunca lo toca ni lo sube):

- `DATABASE_URL` — apuntando a un archivo **fuera** de la carpeta de la
  app (esa carpeta se pisa entera en cada deploy). Ej:
  `file:/home/u590576138/cuartel-del-musico-data/prod.db`.
- `AUTH_SECRET` — uno nuevo generado para producción, no el de desarrollo.

**Ojo con esto** (encontrado probando el build standalone, no antes):
NextAuth v5 rechaza cualquier request en modo producción con
`UntrustedHost` a menos que confíe en el host — con `next dev` no se nota
porque ahí esa validación no corre. Ya está resuelto en código
(`trustHost: true` en `src/auth.ts`, la opción recomendada para hosting
propio detrás de un proxy que uno mismo controla), así que no hace falta
configurar nada extra para esto — queda documentado acá para que quede
claro por qué está esa línea.

**Prisma y la plataforma del servidor**: el generator en
`prisma/schema.prisma` incluye `binaryTargets` para Linux (glibc) además
del nativo de desarrollo, para poder generar el build en Windows y
correrlo en el servidor Linux sin volver a instalar nada ahí. Si al primer
arranque el engine no coincide, Prisma tira un error que nombra el target
exacto que falta agregar.

## Próximos pasos sugeridos

- Configurar el ID de la playlist de YouTube en `/panel/streaming`.
- Cuando esté lista la señal física en vivo (cámara/audio + OBS → YouTube Live), cambiar el modo a `live` desde el mismo panel.
- Fase 2 del stack: una app en **Flutter** para que el staff gestione reservas/inventario desde el celular, consumiendo la misma base de datos vía una API a construir sobre este mismo backend.
