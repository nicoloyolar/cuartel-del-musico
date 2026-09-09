# Sesión de trabajo — 1-2 de septiembre 2026

Notas para retomar. Este archivo es temporal (no forma parte de la
documentación del proyecto) — se puede borrar una vez incorporado lo
pendiente o comiteado el trabajo.

## 2 de septiembre — consolidación de streaming

Objetivo: dejar sólida la funcionalidad de streaming de cara a una demo.

- **Parser de YouTube unificado** en [src/lib/youtube.ts](src/lib/youtube.ts)
  (`extraerVideoId` / `extraerPlaylistId`), usado ahora por `/panel/streaming`
  y `/panel/sesiones` — antes solo sesiones aceptaba pegar el link completo,
  streaming exigía el ID pelado. Verificado con casos reales (watch?v=,
  youtu.be, playlist URL con y sin video, IDs pelados, texto basura).
- **`/panel/streaming` reescrito** como formulario cliente
  ([StreamingForm.tsx](src/app/panel/streaming/StreamingForm.tsx)) con
  `useActionState`: valida el link/ID según el modo, muestra error inline si
  no lo reconoce, y confirma "Guardado ✓" al éxito. Antes fallaba en
  silencio si pegabas algo inválido.
- **Posición inicial de la playlist** (pendiente de la sesión anterior):
  nuevo campo `indiceInicial` en `StreamConfig` (migración
  `20260902140434_agregar_indice_inicial_streaming`), editable solo en modo
  playlist, y ya conectado en [StreamPlayer.tsx](src/components/StreamPlayer.tsx)
  (parámetro `&index=` de YouTube, 0 = primer video).
- Verificado: `tsc --noEmit` limpio, `eslint` limpio, `next build` limpio,
  server de dev levantado y probado con sesión real de login — `/`,
  `/explorar` y `/panel/streaming` (autenticado) responden 200 y el nuevo
  campo "Posición inicial" se ve en el HTML servido.
- Sigue sin comitear nada (ver `git status`).

## 2 de septiembre — canal simulado (sincronía real entre visitantes)

El usuario notó, con razón, que el modo playlist mostraba siempre lo mismo:
cada visitante arrancaba su propia reproducción desde cero (cada uno ve algo
distinto según cuándo entró), lo que rompe la ilusión de "transmisión en
vivo" en cuanto haya más de una persona viendo a la vez.

Solución implementada — **canal simulado** (misma técnica que Pluto TV /
canales de streaming lineal armados sobre contenido grabado):

- Nuevo modelo `CanalItem` (título, youtubeId, duración en segundos, orden),
  gestionable desde `/panel/canal` (agregar con link/ID + duración mm:ss,
  reordenar con ↑/↓, eliminar, ve marcado "Sonando ahora" el item actual).
- [src/lib/canal.ts](src/lib/canal.ts): `calcularPosicionActual()` — pura
  lógica, calcula por reloj de servidor (epoch Unix) qué item + qué segundo
  corresponde ahora mismo. Sin estado guardado: dos consultas en el mismo
  instante devuelven exactamente lo mismo, sin importar quién pregunta.
- [src/lib/stream.ts](src/lib/stream.ts): `resolverEstadoStream()` — decide
  entre modo `live` (señal real, sin cambios) y modo `playlist` (ahora
  resuelto contra `CanalItem` en vez del embed crudo de YouTube).
- [StreamPlayer.tsx](src/components/StreamPlayer.tsx): ya no recibe
  `config` sino `estado: EstadoStream`; embebe el video puntual con
  `&start=<offset>` (ya no hay embed de playlist ni `&loop=1`).
- [CanalAutoRefresh.tsx](src/components/CanalAutoRefresh.tsx): componente
  cliente invisible que agenda `router.refresh()` justo cuando el item
  actual debería terminar, para que el canal avance solo al siguiente sin
  que el visitante recargue a mano.
- `/panel/streaming` se simplificó: en modo playlist ya no pide un
  video/índice (eso lo decide el canal automáticamente) — solo enlaza a
  `/panel/canal`. El campo `indiceInicial` que se había agregado hoy mismo
  para "elegir video inicial" quedó obsoleto y se sacó del schema — la
  posición ahora es siempre calculada, no elegible a mano.
- Seed: canal precargado con las mismas 3 sesiones reales, con
  **duración placeholder de 4:00 cada una** — hay que ajustar a la duración
  real de cada video desde `/panel/canal` para que la sincronía sea exacta
  (ahora mismo el punto calculado es válido pero no coincide con la letra
  real de la canción).
- Verificado: lógica de cálculo con casos borde (lista vacía, duración 0,
  límites exactos de tramo) vía script suelto; build/tsc/eslint limpios;
  end-to-end con curl autenticado — dos requests con ~3s de diferencia
  real mostraron el mismo video con el offset avanzado correctamente
  (157s → 160s), confirmando que la sincronía funciona.

## 2 de septiembre — sin login en /panel/streaming y /panel/canal

A pedido del usuario: el panel interno de gestión (reservas/bandas/equipos/
cobros) todavía no está desarrollado ni diseñado, así que por ahora no tiene
sentido exigir login para revisar/ajustar el streaming. Cambios:

- [src/proxy.ts](src/proxy.ts): `/panel/streaming` y `/panel/canal` quedan
  fuera de la protección de sesión (junto a `/panel/login`, que ya lo
  estaba). El resto de `/panel/*` sigue igual — verificado con curl sin
  cookies: `bandas` sigue devolviendo 307 (redirect a login), `streaming` y
  `canal` devuelven 200 directo.
- Como la barra lateral del staff (`panel/layout.tsx`) solo se muestra con
  sesión, se agregó [StreamingSubNav.tsx](src/components/panel/StreamingSubNav.tsx)
  — una mini-nav (Streaming / Canal / Volver al sitio) que estas dos páginas
  muestran solo cuando no hay sesión, para no quedar sin forma de navegar.
- **Importante para más adelante**: esto también deja sin proteger las
  Server Actions de esas dos páginas (guardar config, crear/mover/eliminar
  items del canal) — cualquiera con el link puede editarlas. Está bien para
  esta etapa (nadie más tiene el link), pero hay que re-proteger esto antes
  de que el sitio esté expuesto de verdad al público.

## Qué se hizo el 1 de septiembre

1. **Streaming de prueba**: se cargó una playlist de YouTube de metal en
   `StreamConfig` (id=1) para ver algo real en la home.
2. **Rediseño premium de la home** (dirección "On Air", elegida sobre una
   alternativa "Industrial/Culto" que se descartó — quedan ambas en el
   canvas de diseño publicado si se quiere revisar):
   - Tipografías Oswald (display) + Manrope (texto), self-hosteadas.
   - Paleta oscura "on air" como tokens de Tailwind v4 en
     [globals.css](src/app/globals.css) (`bg-ink`, `bg-ink-card`, `text-accent`, etc.)
   - Badge "EN VIVO" (rojo, pulsante) / "EN REPRODUCCIÓN" (ámbar) según el
     modo, en [StreamPlayer.tsx](src/components/StreamPlayer.tsx).
   - Sección "Hoy en la sala" con tarjetas + ecualizador animado para la
     banda que está tocando ahora mismo, en [page.tsx](src/app/page.tsx).
3. **Loop infinito**: se agregó `&loop=1` al embed en modo playlist para
   que la lista se repita sola en vez de derivar a sugerencias de YouTube.
4. **Catálogo "modo Netflix"** (`/explorar`), separado del canal
   "radio-tv" de la home:
   - Modelo `Sesion` nuevo en `prisma/schema.prisma` (migración
     `20260901221619_agregar_sesiones`, ya aplicada).
   - Cargadas 3 sesiones reales (vía seed): Krohma — Onírica, Pusfecal —
     Sesión en vivo, Cherry Skulls — Shadows of the Past. Las tres
     grabadas en la sala misma.
   - Página pública [explorar/page.tsx](src/app/explorar/page.tsx) +
     [Catalogo.tsx](src/components/Catalogo.tsx) (cliente: clic en una
     miniatura cambia el video destacado sin recargar).
   - Panel de gestión [panel/sesiones](src/app/panel/sesiones/page.tsx)
     para cargar/eliminar sesiones sin tocar código (acepta link completo
     de YouTube o el ID pelado).
   - Link "Explorar la escena →" agregado al header de la home.

## Estado del entorno

- Server de dev corriendo en background (`npm run dev`, puerto 3000).
  Si no responde: los procesos `node.exe` pueden quedar colgados tras un
  `prisma migrate` — matar todo con
  `Get-Process node | Stop-Process -Force` y volver a levantarlo.
- Nada de esto está comiteado en git todavía — hay ~7 archivos
  modificados y 4 nuevos (`git status` para el detalle). Falta decidir
  si se commitea ahora o se sigue iterando primero.

## 7 de septiembre — filtro por banda en /explorar

Se encontró un cambio sin commitear ni documentar en
[Catalogo.tsx](src/components/Catalogo.tsx) (chips de filtro por banda,
solo visibles si hay más de una banda cargada). Se terminó de integrar al
diseño: antes usaba estilos inline con `var(--color-*)`, ahora usa las
clases Tailwind del resto del sitio (`border-accent`, `bg-accent/10`,
`text-accent-soft`, `border-ink-border`, `font-display` uppercase con
tracking, como los demás badges). Verificado `tsc --noEmit` y `eslint`
limpios. Sigue sin commitear.

## 7 de septiembre — /agenda migrada a la paleta "on air"

Reescrito [agenda/page.tsx](src/app/agenda/page.tsx) con los mismos tokens
y patrones del resto del sitio (`ink-card`/`ink-border`, `font-display`
uppercase para encabezados de sección, badge "Ensayando ahora" con el
mismo tratamiento que "Hoy en la sala" de la home cuando una reserva está
pasando en este momento — esto último no existía antes, la agenda vieja no
distinguía "ahora" de "más tarde esta semana"). Verificado `tsc`, `eslint`
y `next build` limpios.

## 7 de septiembre — re-proteger las Server Actions de streaming/canal

Se cerró el hueco de seguridad anotado el 2 de septiembre: las páginas
`/panel/streaming` y `/panel/canal` siguen viéndose sin login (decisión
del usuario, sin cambios), pero **guardar/editar ahora exige sesión**:

- [canal/actions.ts](src/app/panel/canal/actions.ts) y
  [streaming/actions.ts](src/app/panel/streaming/actions.ts): cada Server
  Action (`crearCanalItem`, `eliminarCanalItem`, `moverCanalItem`,
  `guardarStreamConfig`) chequea `auth()` al entrar y aborta sin sesión —
  esta es la protección real, no solo ocultar botones en la UI.
- [canal/page.tsx](src/app/panel/canal/page.tsx) y
  [streaming/page.tsx](src/app/panel/streaming/page.tsx): sin sesión, en
  vez de un formulario que fallaría en silencio, se muestra un aviso
  "Estás viendo esto sin iniciar sesión... Iniciar sesión para editar →"
  con link a `/panel/login?callbackUrl=...`. Con sesión, todo sigue igual
  que antes (sin regresión).
- Verificado: `tsc`, `eslint`, `next build` limpios; end-to-end con curl:
  sin cookies ambas páginas responden 200 y muestran el aviso de login;
  con sesión real (login vía NextAuth credentials) el formulario de
  edición vuelve a aparecer normal.
- Motivo de hacerlo ahora (no antes): el dominio `cuarteldelmusico.cl` ya
  apunta a Hostinger y se está armando el deploy real (ver sesión de
  hosting) — se acerca el momento en que esto queda expuesto de verdad.

## 7 de septiembre — todo /panel migrado a la paleta on-air

A pedido explícito del usuario ("le demos a todo"), se migró **todo** el
panel de staff a los mismos tokens que ya tenían home/agenda/explorar —
hasta ahora ninguna página de `/panel` había recibido el rediseño, todas
seguían con la paleta plana original (`neutral-800/900/950/700`, botones
blancos). Alcance completo: `panel/layout.tsx` (sidebar + nav + logout),
`panel/login`, `panel/page.tsx` (dashboard), `reservas`, `bandas`,
`equipos` (+ `EstadoSelect.tsx`), `cobros`, `streaming` (+
`StreamingForm.tsx`), `canal`, `sesiones`, y
[StreamingSubNav.tsx](src/components/panel/StreamingSubNav.tsx).

- Contenedores: `border-neutral-800 bg-neutral-900` → `border-ink-border
  bg-ink-card`; inputs: `border-neutral-700 bg-neutral-950` →
  `border-ink-border bg-ink` (+ `text-neutral-100` explícito).
- Texto secundario: `text-neutral-400` → `text-muted`, `text-neutral-500`
  → `text-muted-2`.
- Títulos `h1`: `font-display` en vez de solo `font-bold`.
- Botones primarios ("Guardar"/"Agregar"/"Crear"/"Entrar"): pasaron de un
  pill blanco (`bg-white text-neutral-950`) a `bg-accent
  hover:bg-accent-soft text-neutral-50` — coherente con el resto del sitio,
  donde el acento rojo es la acción primaria.
- Colores semánticos de estado (emerald/blue/amber/red para
  confirmada/completada/pendiente/etc.) se dejaron igual — no son parte de
  la paleta vieja, son indicadores intencionales.
- Verificado: `grep` confirma cero clases `neutral-700/800/900/950` o
  `bg-white` restantes en `src/app/panel` y `src/components/panel`;
  `tsc`, `eslint`, `next build` limpios; end-to-end con curl + login real
  (NextAuth) sobre las 9 rutas del panel — todas 200 con los tokens
  nuevos presentes en el HTML servido, sin login sigue mostrando el aviso
  en streaming/canal, y `/panel/bandas` sin sesión sigue redirigiendo
  (307) como corresponde.

## 7 de septiembre — validación de reservas + feedback de error en toggles

Cerrados los dos huecos funcionales detectados al revisar el panel:

- **`crearReserva`** ahora valida: `fin` posterior a `inicio`, y que la
  sala no esté ya reservada en ese tramo (se compara contra todas las
  reservas no canceladas — `CONFIRMADA`/`COMPLETADA` — con solapamiento
  de intervalos; back-to-back no cuenta como conflicto). Antes se podía
  reservar dos veces el mismo horario sin aviso. Pasó de un `<form
  action={crearReserva}>` sin feedback a un componente cliente
  ([ReservaForm.tsx](src/app/panel/reservas/ReservaForm.tsx)) con
  `useActionState`, mismo patrón que `StreamingForm.tsx` — muestra el
  error inline (qué banda ya tiene la sala y a qué hora) o "Reserva
  creada ✓".
- **`EstadoSelect`** (equipos) y **`PagadoToggle`** (cobros): antes
  llamaban a la Server Action sin `await` ni manejo de error — si fallaba
  el guardado, la UI quedaba mostrando el cambio como si hubiese
  funcionado. Ahora usan estado optimista + `useTransition`: si la acción
  tira error, revierten el valor visual y muestran "No se pudo guardar".
- Verificado: `tsc`, `eslint`, `next build` limpios; lógica de
  solapamiento probada con 9 casos (completo, parcial x2, contenido
  adentro, back-to-back x2, sin relación x2, cancelada no cuenta) vía
  script suelto contra la base de dev real — los 9 pasaron; smoke test
  con dev server + login real sobre las 3 páginas tocadas, sin errores
  en el log del servidor.

## 7 de septiembre — investigación del upgrade de Prisma (se pospone, con más detalle)

Se revisó en serio la posibilidad de subir Prisma (no solo "queda pendiente"
genérico). Hallazgos:

- **Versión real disponible**: 7.10.0 es la última **estable** (Prisma 7
  salió el 19 nov 2025). 8.0.0 sigue en **release candidate** (rc.13) — y
  ojo, el dist-tag `latest` de npm hoy apunta al RC de 8, no a la
  estable 7.10.0 (`npm install prisma@latest` instalaría el RC sin
  avisar). El `^6.19.3` actual en `package.json` no corre ese riesgo
  solo (caret respeta major), pero conviene tenerlo presente para
  cuando se suba.
- **Radio de impacto en código chico**: solo 4 archivos importan de
  `@prisma/client` directamente (`src/lib/prisma.ts`,
  `panel/equipos/actions.ts` y `EstadoSelect.tsx`,
  `panel/reservas/actions.ts`).
- **El problema real no es el tamaño del cambio, es la madurez del
  camino para este stack puntual**: Prisma 7 exige adoptar driver
  adapters (`@prisma/adapter-better-sqlite3`), un nuevo generator
  (`prisma-client` en vez de `prisma-client-js`) con `output` explícito,
  mover el `datasource.url` a un nuevo `prisma.config.ts`, y en varias
  guías, pasar el proyecto a ESM (`"type": "module"`). Investigando la
  combinación específica **Next.js 16 + Turbopack** (lo que usa este
  proyecto), aparecen reportes recientes de un bug real:
  `Cannot find module ".prisma/client/default"` con Turbopack
  específicamente (no pasa con webpack) — y **fuentes de la comunidad se
  contradicen** entre sí sobre la config correcta (una dice usar el
  generator nuevo + adapter + ESM; otra dice mantener
  `prisma-client-js` y solo agregar `serverExternalPackages` en
  `next.config.ts`). La documentación oficial de Prisma para Next.js
  está pensada para proyectos nuevos armados con su propio scaffolding,
  no cubre migrar un proyecto Turbopack existente.
- **Decisión**: no es deuda técnica simple, es un área todavía inestable
  para esta combinación de stack puntual — se pospone hasta que el
  ecosistema madure, en vez de intentarlo ahora y arriesgar quedar en un
  estado roto por un bug de terceros justo antes del deploy real. El
  usuario decidió explícitamente esperar en vez de probarlo en una rama.
- **Al retomar**: revisar si sigue habiendo reportes de ese bug con
  Turbopack antes de intentarlo, o esperar a que Prisma 8 sea estable
  (probablemente para entonces esto esté más resuelto). No usar
  `prisma@latest` a ciegas — apuntar a la versión estable exacta.

## 7 de septiembre — preparación del deploy (standalone + deploy.sh)

Se retomó el plan de lanzamiento (ver memoria del proyecto): se dejó listo
todo lo que no depende de que el usuario cree la app Node en hPanel.

- **`next.config.ts`**: `output: "standalone"` — el hosting (CloudLinux
  Node.js Selector / Passenger) espera este formato.
- **Hallazgo real #1 — engine de Prisma con la plataforma equivocada**:
  el build local en Windows solo genera el engine de Windows
  (`query_engine-windows.dll.node`); copiado tal cual al servidor Linux,
  cualquier consulta a la base habría fallado. Se agregó `binaryTargets =
  ["native", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]` al generator
  en `prisma/schema.prisma` (glibc, no musl — CloudLinux es RHEL-like) y
  se corrió `prisma generate` de nuevo: ahora los 3 engines quedan en
  `node_modules/.prisma/client` y el standalone los incluye. No se pudo
  confirmar por SSH la versión exacta de OpenSSL del sandbox (la app
  Node no existe todavía) — si al primer arranque real no coincide,
  Prisma tira un error que nombra el target exacto que falta.
- **Hallazgo real #2 — login roto en producción**: probando el build
  standalone de verdad (`node server.js`, no `next dev`) apareció
  `UntrustedHost` de NextAuth v5 en cualquier request — este chequeo no
  corre en modo dev, por eso nunca se vio en toda la sesión. Sin
  arreglarlo, el login se habría roto por completo en el primer deploy
  real. Solución aplicada en [src/auth.ts](src/auth.ts): `trustHost:
  true` (la opción recomendada para hosting propio detrás de un proxy
  propio). Verificado con login real de punta a punta sobre el server
  standalone (`node server.js` con `PORT` propio): antes tiraba el error
  en cada request, después el login funcionó y `/panel/bandas` con
  sesión respondió 200 sin errores en el log.
- **[deploy.sh](deploy.sh)**: script nuevo (basado en el de
  `vistasauvalle`, mismas credenciales SSH de esa cuenta Hostinger) que
  arma la carpeta de despliegue (standalone + `.next/static` + `public/`
  si existe + `prisma/schema.prisma`), pide confirmación mostrando qué se
  sube, sube por `rsync` (sin tocar `.env` ni archivos `.db` existentes
  en el servidor), reinicia la app tocando `tmp/restart.txt` (convención
  de Passenger, no depende de ninguna herramienta de CLI que esta cuenta
  no tiene) y verifica que el sitio responda. **Todavía no probado contra
  el servidor real** — tiene 2 `TODO` marcados (`REMOTE_APP_ROOT` y
  `REMOTE_ERROR_LOG`) que solo se conocen una vez creada la app en hPanel.
- **README.md**: nueva sección "Producción / deploy" documentando las
  variables de entorno que necesita el `.env` de producción
  (`DATABASE_URL` apuntando **fuera** de la carpeta de la app —
  mismo criterio que `wp-content/uploads` en los sitios WordPress de la
  cuenta, para que sobreviva a los redeploys — y `AUTH_SECRET` nuevo) y
  el motivo del `trustHost`.
- Verificado: `tsc`, `eslint`, `next build` limpios; standalone probado
  de punta a punta corriendo de verdad (`node .next/standalone/server.js`)
  con las páginas públicas + login real, no solo con `next dev`.
- **Sigue pendiente** (bloqueado en el usuario): crear el dominio +
  la app Node en hPanel. Una vez exista, hay que completar los 2 `TODO`
  de `deploy.sh` con los datos reales y probar un primer deploy real.

## 7-8 de septiembre — deploy real en curso: Hostinger "App web de Node.js" + MySQL

Se avanzó en vivo, junto con el usuario navegando hPanel. Hallazgos que
cambian lo planeado antes:

- **El hosting real no es CloudLinux Node.js Selector** (lo que se había
  confirmado por SSH días atrás) — es el producto más nuevo de Hostinger,
  **"App web de Node.js"**: deploy vía Git (conectado a
  `github.com/nicoloyolar/cuartel-del-musico`, rama `main`,
  auto-deploy en cada push), build en su propia infraestructura. El
  `deploy.sh` armado antes (rsync + convención Passenger) **no aplica a
  este producto** — quedó obsoleto, no se borró pero no se va a usar así.
- **Subdominio elegido**: `streaming.cuarteldelmusico.cl` (la raíz del
  dominio la sirve el proyecto hermano de WordPress, `cuarteldelmusicocl`).
- **SQLite no es viable en este hosting**: la doc de Hostinger para este
  producto recomienda explícitamente no depender de archivos locales
  (la app se puede reconstruir en cada deploy) y ofrece MySQL administrado
  incluido. Se migró la base de **SQLite a MySQL** (esto ya estaba
  anotado como intención desde el README original: "fácil de migrar a
  Postgres/producción").
  - `prisma/schema.prisma`: `datasource.provider` de `sqlite` a `mysql`,
    más `shadowDatabaseUrl` (el usuario de MySQL compartido no tiene
    permiso de crear bases, así que `migrate dev` necesita una segunda
    base vacía aparte solo para ese uso interno).
  - Se borraron las migraciones viejas de SQLite (no había datos reales
    de producción que preservar) y se generó `20260908015058_init_mysql`
    desde cero contra la base real.
  - **Credenciales reales de producción** (dos bases en la cuenta
    Hostinger, host `srv1577.hstgr.io:3306`, acceso remoto abierto a
    "cualquier host" — protegido solo por contraseña):
    - `u590576138_cuartel_prod` / usuario `u590576138_cuartel_admin` — la
      base real de la app.
    - `u590576138_cuartel_shadow` / usuario `u590576138_cuartel_shadow` —
      solo para que Prisma calcule migraciones, no la usa la app.
    - Contraseña generada (no la de Hostinger, esa se cambió por ser
      predecible): ver `.env` local (`DATABASE_URL` /
      `SHADOW_DATABASE_URL`) — no está en ningún otro lado, `.env` está
      gitignorado.
  - **Ojo — dev y prod comparten la misma base por ahora**: no se separó
    un MySQL de desarrollo aparte todavía (se decidió así para no sumar
    otro paso en medio del setup). Antes de que haya datos reales de
    clientes, conviene crear una base de dev separada para no mezclar
    pruebas locales con producción.
  - Seed corrido contra la base real (usuario admin
    `admin@cuarteldelmusico.cl` / `cambiar123` ya existe ahí).
- Verificado de punta a punta: `tsc`, `eslint`, `next build` limpios;
  `npm run dev` real contra la base MySQL de producción — páginas
  públicas 200, login real vía NextAuth + `/panel/bandas` autenticado
  200, sin errores en el log del servidor.
- **Primer deploy real: hecho y funcionando.** Variables de entorno
  cargadas (`DATABASE_URL`, `AUTH_SECRET` nuevo de producción) vía el
  modal de Hostinger, clic en "Implementar", build sin errores
  (`Compiled successfully`, TypeScript sin errores). Verificado en vivo
  desde acá: `/`, `/explorar`, `/agenda`, `/panel/login` responden 200
  en `https://streaming.cuarteldelmusico.cl` real. Auto-deploy en cada
  push a `main` queda activo de acá en adelante — no hace falta correr
  nada manual para el próximo cambio, solo comitear y pushear.

## 8 de septiembre — identidad de marca real (colores, logo, favicon)

El usuario pidió alinear la identidad con la del sitio informativo (WordPress,
proyecto hermano `cuarteldelmusicocl`, tema `cdm-child`) — encontrado y leído
desde ahí (`landing.css`, `front-page.php`, `assets/favicon.svg`,
`wp-content/uploads/2026/09/site-icon-master.png`).

- **Colores**: se corrigieron los tokens en
  [globals.css](src/app/globals.css) para que coincidan con los oficiales
  (`--cdm-ink: #0c0c0e`, `--cdm-card: #1a1719`, `--cdm-red-2: #c62828`) —
  antes eran valores propios inventados, cercanos pero no iguales
  (`--color-accent` era `#e11d2e`, un rojo más vívido que el oficial
  `#c62828`, más ladrillo). Tipografías (Oswald + Manrope) ya coincidían
  de casualidad — no hubo que tocar eso.
- **Logo**: el ícono real de la marca es un círculo + 4 marcas cardinales
  (estilo reloj/brújula) + una nota musical — se usa igual en dos formas en
  el sitio oficial: contorno sin fondo (color de acento, para el header) y
  versión rellena con fondo oscuro (para favicon). Se reemplazó el ícono
  genérico del header de la home (un cuadrado con degradado + un ícono sin
  relación) por el contorno oficial exacto, en
  [page.tsx](src/app/page.tsx).
- **Favicon**: nuevo [icon.svg](src/app/icon.svg) (convención de Next.js —
  se conecta solo al `<head>`) con el mismo SVG relleno que usa el sitio
  oficial como favicon. Se borró el `favicon.ico` genérico de Next que
  quedaba del scaffold inicial, para que no compita.
- Se aprovechó para sacar los dos degradados a **naranja** que quedaban de
  antes (`to-orange-400`/`to-orange-500`, en `page.tsx` y `agenda/page.tsx`)
  — el naranja no es parte de la paleta oficial, se cambiaron a la familia
  de rojos de marca (`to-red-900`, mismo criterio que ya se usaba en otro
  lado de `page.tsx`).
- Verificado: `tsc`, `eslint`, `next build` limpios (`/icon.svg` aparece
  como ruta estática nueva); smoke test con dev server real — `/icon.svg`
  responde 200 con el color oficial `#c62828` en el SVG servido, el
  `<link rel="icon">` se generó solo en el `<head>`, y el logo nuevo
  aparece en el HTML de la home.

## 8 de septiembre — canal cargado con todo el catálogo real de YouTube

El usuario pidió sumar todos los videos del canal de YouTube
(`@cuarteldelmusico`) al canal simulado, con duración real (no el
placeholder de 4:00 que tenían los 3 primeros).

- Se instaló temporalmente `youtubei.js` (`npm install --no-save`, sin
  tocar `package.json`/`package-lock.json`) para listar los videos del
  canal y su duración real sin necesitar API key de Google.
- 86 videos encontrados. Se excluyeron los 3 que ya estaban cargados
  (mismos IDs: Krohma, Pusfecal, Cherry Skulls) y, a pedido del usuario,
  un video de 10 segundos ("LOGO CUARTEL DEL MÚSICO", bumper del logo,
  no una sesión real). **82 videos nuevos cargados** directo en la tabla
  `CanalItem` de producción vía un script suelto (con `orden`
  correlativo después de los 3 existentes) — no se tocó `Sesion`
  (catálogo `/explorar`), esto fue solo para el canal continuo.
- Todos los scripts sueltos y el paquete temporal se borraron al
  terminar — no queda rastro en el repo (`git status` limpio salvo
  `SESION.md`).
- **Duración total del ciclo: ~37.4 horas** (antes eran 12 minutos con
  los 3 placeholder). Verificado en producción real:
  `/panel/canal` muestra "2243:57" como duración total del ciclo y los
  nuevos items (`canal-yt-<id>`) aparecen en la lista.
- No hizo falta ningún commit/deploy — esto es contenido en la base de
  datos, no código.

## 8 de septiembre — pasada editorial sobre los 82 títulos nuevos

Los títulos venían tal cual YouTube (mayúsculas sostenidas, separadores
inconsistentes " - "/"/", espacios dobles, menciones redundantes de
"Cuartel del Músico"). Se normalizaron todos a formato título +
`Banda — Descripción` (mismo criterio que Krohma/Pusfecal/Cherry Skulls),
y se unificó la serie "Sesiones de la Raíz" (aparecía con el nombre en
distinto orden en cada video) a `Sesiones de la Raíz — <Banda>`.

Dos ambigüedades reales (no se podían resolver sin el usuario) se
consultaron y quedaron resueltas:
- "Conce al Aire (Live) Fest" — 4 videos decían "Live Fest" y uno solo
  "Fest" (sin Live) → se unificó a "Conce al Aire Live Fest" en los 5.
- "(La) Chupilca del Diablo" — 2 videos sin artículo, 1 con → se unificó
  a "Chupilca del Diablo" (sin "La") en los 3.

Aplicado directo en producción vía script suelto (borrado al terminar).
Verificado en vivo: `/panel/canal` muestra los títulos nuevos. Sin
cambios de código — es contenido, no commit.

## 8 de septiembre — los mismos 82 videos, también en /explorar

A pedido del usuario, se sumaron los mismos videos nuevos al catálogo
`/explorar` (modelo `Sesion`), separado de `CanalItem`. A diferencia del
canal (un solo campo `titulo`), acá hay que partir "Banda — Descripción"
en `bandaNombre` + `titulo` por separado — con cuidado en la serie
"Sesiones de la Raíz", donde la banda real es la que toca (ej. banda
`Cangaceiro`, título `Sesiones de la Raíz`), no la serie. Un caso
especial: el video "Sesiones en Vivo de la Raíz - Onírica" se asignó a
banda `Krohma` (mismo nombre de canción que su sesión ya conocida, es
casi con certeza la misma banda tocándola de nuevo para la serie).

- **85 sesiones totales, 70 bandas distintas** — el filtro por banda de
  `Catalogo.tsx` (agregado hace unos días) ahora tiene un catálogo real
  donde importa, antes solo había 3 bandas.
- Aplicado directo en producción vía script suelto (borrado al
  terminar). Verificado en vivo: `/explorar` responde 200 y muestra el
  contenido nuevo.

## 8 de septiembre — auditoría visual real ("imagen ultra premium")

El usuario pidió una pasada de calidad visual para impresionar a un
cliente. Hasta ahora todo se había verificado con curl/grep — nunca se
había *visto* el sitio realmente. Se instaló Playwright temporalmente
(`npm install --no-save`, + `npx playwright install chromium`, ambos
borrados/revertidos al terminar) para sacar capturas reales (desktop +
mobile) de home, `/explorar` y `/agenda`, y detectar problemas que solo
se ven mirando, no con requests HTTP.

Hallazgos reales y arreglados:

- **Chrome nativo de YouTube de más**: el embed mostraba branding y
  sugeridos de YouTube sin necesidad. Se agregó
  `modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0` a los
  embeds de [StreamPlayer.tsx](src/components/StreamPlayer.tsx) y
  [Catalogo.tsx](src/components/Catalogo.tsx) — se mantuvo `controls=1`
  a propósito (ahí vive el botón de mute, necesario porque el autoplay
  va silenciado; sacar controls habría dejado al visitante sin forma de
  activar el audio). Se sacaron también los subtítulos automáticos que
  aparecían prendidos por defecto ("[Risas] [Música]" superpuesto).
  `/explorar` no tenía `mute=1` — se agregó, para que el autoplay
  funcione en vez de quedar pausado en la miniatura.
- **Filtro por banda desbordado**: con 70 bandas reales (cargadas hoy
  mismo), la fila de chips de `Catalogo.tsx` se desbordaba en ~10 filas
  — se veía desprolijo. Se reemplazó por un `<select>` (con las bandas
  ordenadas alfabéticamente, más fácil de ubicar una puntual a esta
  escala) — mismo criterio de diseño, escala sin romperse.
- **Dato de prueba real en producción**: la agenda mostraba "Banda de
  Ejemplo" (el seed inicial del 1 de septiembre, nunca se había
  sacado) como si fuera una reserva real de hoy — se veía roto para un
  cliente. Se borró (`banda-demo` + su reserva, cascada) directo de la
  base de producción. **La agenda y el dashboard del panel quedan en 0
  reservas reales** — hace falta cargar reservas de verdad desde
  `/panel/reservas` para que deje de verse vacío (no se inventó nada
  para "rellenar", eso sería deshonesto).
- **Header roto en mobile**: "Cuartel del Músico" se partía en 3 líneas
  (una palabra por línea) en un viewport de 390px, y el badge "Canal ·
  Cuartel del Músico" se superponía con el de "En reproducción" sobre
  el video. Se cambió el header a columna en mobile (marca arriba, nav
  debajo) con texto más chico + `whitespace-nowrap`, y el badge de canal
  se oculta en mobile (`hidden sm:flex`) — el de estado (En vivo/En
  reproducción) es el que importa de verdad, no hay espacio para los dos.
- Verificado con capturas antes/después de cada arreglo (antes: se veían
  los problemas; después: confirmados corregidos), `tsc`, `eslint`,
  `next build` limpios.

## 8 de septiembre — filtro por banda: de select a buscador (combobox)

El usuario pidió que el filtro de `/explorar` tuviera buscador además del
desplegable. Se reemplazó el `<select>` nativo por un combobox a medida
en [Catalogo.tsx](src/components/Catalogo.tsx) (`FiltroBanda`, mismo
archivo): input de texto que al escribir filtra las bandas en vivo
(normalizado sin acentos/mayúsculas), lista desplegable debajo con
"Todas (n)" siempre arriba, botón "✕" para limpiar cuando hay filtro
activo, Enter elige la primera coincidencia, Escape cierra. Accesible
(`role="combobox"`, `aria-expanded`, `aria-controls`).

Verificado con Playwright (instalado y borrado de nuevo, igual que la
ronda anterior): escribir "krohma" filtra a 1 resultado, elegirlo desde
la lista actualiza el video destacado y la grilla, el botón de limpiar
aparece y funciona. `tsc`, `eslint` (con el warning de a11y resuelto:
faltaba `aria-controls`), `next build` limpios.

## Pendiente / ideas para retomar

- ~~Deploy real~~ — hecho el 8 de septiembre, ver sección de arriba.
  `deploy.sh` quedó obsoleto (asumía el hosting viejo,
  CloudLinux/Passenger) — el deploy real es por Git push, no hace falta
  ese script. Pendiente decidir si conviene borrarlo o dejarlo por si se
  vuelve a necesitar un camino manual.
- **Separar base de datos de desarrollo**: hoy dev y producción apuntan a
  la misma base MySQL (`u590576138_cuartel_prod`) — crear una base de dev
  aparte antes de que haya datos reales de clientes.
- **Cargar reservas reales**: se borró el dato de prueba ("Banda de
  Ejemplo") — la agenda y el dashboard del panel quedan honestamente
  vacíos hasta que se cargue al menos una reserva real desde
  `/panel/reservas`.
- **Reproductor con chrome propio** (idea a futuro, no urgente): hoy es
  un iframe crudo de YouTube — se le quitó branding/sugeridos/subtítulos
  vía parámetros de URL, pero sigue mostrando la barra de controles
  nativa de YouTube (necesaria para el botón de mute). Un player
  totalmente a medida (controles propios dibujados por nosotros, usando
  la API de IFrame de YouTube en vez de un iframe crudo) se vería más
  "canal propio" todavía, pero es una feature más grande, no un ajuste
  rápido.
- ~~Elegir video inicial dentro de la playlist~~ — hecho el 2 de septiembre.
- ~~Filtro por banda en /explorar~~ — hecho el 7 de septiembre.
- ~~Migrar /agenda a la paleta nueva~~ — hecho el 7 de septiembre.
- ~~Re-proteger Server Actions de streaming/canal~~ — hecho el 7 de septiembre.
- Prisma sigue en 6.19.3 — pospuesto a propósito, no por pereza: subir a
  la estable 7.10.0 exige driver adapters + ESM, y esa combinación con
  Next.js 16 + Turbopack tiene bugs activos reportados (ver detalle más
  arriba). Revisar de nuevo más adelante, apuntando siempre a la versión
  estable exacta (nunca `@latest` a ciegas, hoy apunta al RC de 8).
- El catálogo de `/explorar` ya tiene filtro por banda; si sigue creciendo,
  considerar agrupar también por género o por fecha.
