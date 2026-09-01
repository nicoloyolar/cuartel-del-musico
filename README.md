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

## Próximos pasos sugeridos

- Configurar el ID de la playlist de YouTube en `/panel/streaming`.
- Cuando esté lista la señal física en vivo (cámara/audio + OBS → YouTube Live), cambiar el modo a `live` desde el mismo panel.
- Fase 2 del stack: una app en **Flutter** para que el staff gestione reservas/inventario desde el celular, consumiendo la misma base de datos vía una API a construir sobre este mismo backend.
