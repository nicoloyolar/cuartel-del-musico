#!/usr/bin/env bash
#
# deploy.sh — despliegue de cuartel-del-musico (local -> producción)
#
# Empaqueta el build standalone de Next.js y lo sube al hosting Node.js de
# Hostinger (mismo hosting/credenciales que vistasauvalle.cl — ver
# PROYECTO.md de ese proyecto, sección "Producción").
#
# Qué hace:
#   1. `prisma generate` (asegura que los engines de Linux estén frescos,
#      ver `binaryTargets` en prisma/schema.prisma) + `next build`.
#   2. Arma una carpeta de despliegue: standalone/ + .next/static/ (Next NO
#      los incluye solo) + prisma/schema.prisma (para poder correr
#      `prisma migrate deploy` a mano por SSH si hace falta más adelante).
#   3. Pide confirmación mostrando qué se va a subir.
#   4. Sube por scp/rsync a REMOTE_APP_ROOT.
#   5. Reinicia la app tocando tmp/restart.txt (convención estándar de
#      Passenger — no depende de ninguna herramienta de CLI de cPanel/
#      CloudLinux, que esta cuenta no tiene disponible).
#   6. Verifica que el sitio responda.
#
# IMPORTANTE — esto todavía NO está probado en el servidor real:
#   - REMOTE_APP_ROOT es un placeholder. Falta que el usuario cree la app
#     Node en hPanel (Websites → el dominio → Node.js → Setup Node App) y
#     confirmar ahí cuál queda como "Application root" real.
#   - "Application startup file" en hPanel debe apuntar a `server.js`
#     (relativo a Application root) — eso es lo que este script sube a la
#     raíz de REMOTE_APP_ROOT.
#   - El archivo `.env` de producción se crea UNA VEZ a mano por SSH en
#     REMOTE_APP_ROOT (este script nunca lo toca ni lo sube) con al menos:
#       DATABASE_URL="file:/home/u590576138/cuartel-del-musico-data/prod.db"
#       AUTH_SECRET="<generar uno nuevo, distinto al de dev>"
#     El archivo .db vive FUERA de REMOTE_APP_ROOT a propósito (mismo
#     criterio que wp-content/uploads en los sitios WordPress de esta
#     cuenta): cada deploy resube toda la carpeta de la app, así que
#     cualquier archivo adentro se pierde/pisa en el próximo deploy.
#   - Si al primer arranque Prisma tira un error de engine (plataforma no
#     coincide), el mensaje nombra el `binaryTarget` exacto que falta —
#     agregarlo en prisma/schema.prisma, correr `prisma generate` y
#     volver a desplegar.
#
# Uso:
#   ./deploy.sh

set -euo pipefail

# ── Configuración ────────────────────────────────────────────────────────
SSH_KEY="$HOME/.ssh/hostinger_corp"
SSH_PORT="65002"
SSH_HOST="195.200.3.223"
SSH_USER="u590576138"

# TODO: confirmar con el usuario una vez creada la app en hPanel.
REMOTE_APP_ROOT="/home/u590576138/TODO-cuartel-del-musico-app"
REMOTE_ERROR_LOG="/home/u590576138/TODO-ruta-al-log-de-la-app"
SITE_URL="https://cuarteldelmusico.cl"

LOCAL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_DIR="$(mktemp -d)"

CHECK_PAGES=(
  "/"
  "/agenda"
  "/explorar"
  "/panel/login"
)

SSH_CMD=(ssh -i "$SSH_KEY" -p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=15 "${SSH_USER}@${SSH_HOST}")

echo "=== 1/6 — Generando Prisma Client y build de producción ==="
(cd "$LOCAL_ROOT" && npx prisma generate && npx next build)
echo ""

echo "=== 2/6 — Armando la carpeta de despliegue ==="
cp -r "$LOCAL_ROOT/.next/standalone/." "$STAGE_DIR/"
cp -r "$LOCAL_ROOT/.next/static" "$STAGE_DIR/.next/static"
if [ -d "$LOCAL_ROOT/public" ]; then
  cp -r "$LOCAL_ROOT/public" "$STAGE_DIR/public"
fi
mkdir -p "$STAGE_DIR/prisma"
cp "$LOCAL_ROOT/prisma/schema.prisma" "$STAGE_DIR/prisma/schema.prisma"
# No sirven en Linux — se descartan para no subir peso de más.
rm -f "$STAGE_DIR"/node_modules/.prisma/client/query_engine-windows.dll.node*
echo "  ✓ Carpeta armada en $STAGE_DIR"
echo ""

echo "=== 3/6 — Esto es lo que se va a subir a producción ==="
du -sh "$STAGE_DIR"
echo "  destino: ${SSH_USER}@${SSH_HOST}:$REMOTE_APP_ROOT"
echo ""
read -r -p "¿Confirmas que quieres subir esto a cuarteldelmusico.cl ahora? (escribe 'si' para continuar): " confirm
if [ "$confirm" != "si" ]; then
  echo "Cancelado, no se subió nada."
  rm -rf "$STAGE_DIR"
  exit 0
fi
echo ""

echo "=== 4/6 — Subiendo archivos (rsync, preserva .env y la base existentes) ==="
"${SSH_CMD[@]}" "mkdir -p '$REMOTE_APP_ROOT'"
rsync -az --delete \
  --exclude ".env" \
  --exclude "*.db" \
  --exclude "*.db-journal" \
  -e "ssh -i $SSH_KEY -p $SSH_PORT" \
  "$STAGE_DIR/" "${SSH_USER}@${SSH_HOST}:$REMOTE_APP_ROOT/"
echo "  ✓ Archivos subidos"
echo ""

echo "=== 5/6 — Reiniciando la app (convención Passenger: tmp/restart.txt) ==="
"${SSH_CMD[@]}" "mkdir -p '$REMOTE_APP_ROOT/tmp' && touch '$REMOTE_APP_ROOT/tmp/restart.txt'"
echo "  ✓ Reinicio solicitado"
echo ""

echo "=== 6/6 — Verificación post-deploy ==="
sleep 3
for page in "${CHECK_PAGES[@]}"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 15 "${SITE_URL}${page}")
  if [ "$code" = "200" ] || [ "$code" = "307" ]; then
    echo "  ✓ $page -> HTTP $code"
  else
    echo "  ✗ $page -> HTTP $code   <-- revisar"
  fi
done
echo ""
echo "Últimas 20 líneas del log del servidor (si la ruta ya está confirmada):"
"${SSH_CMD[@]}" "tail -n 20 '$REMOTE_ERROR_LOG' 2>/dev/null" || echo "  (no se pudo leer error_log — falta confirmar REMOTE_ERROR_LOG)"

rm -rf "$STAGE_DIR"
echo ""
echo "=== Deploy terminado ==="
