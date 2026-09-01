import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Usuario admin del panel ---
  const adminEmail = "admin@cuarteldelmusico.cl";
  const adminPassword = "cambiar123"; // cámbiala apenas entres

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  // --- Configuración inicial del streaming: fase 1, playlist de YouTube ---
  await prisma.streamConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      modo: "playlist",
      youtubeId: "", // pega aquí el ID de tu lista de reproducción de YouTube
      titulo: "Sesiones en Cuartel del Músico",
    },
  });

  // --- Bandas de ejemplo ---
  const banda = await prisma.banda.upsert({
    where: { id: "banda-demo" },
    update: {},
    create: {
      id: "banda-demo",
      nombre: "Banda de Ejemplo",
      contacto: "Juan Pérez",
      telefono: "+56 9 1234 5678",
      email: "contacto@bandaejemplo.cl",
      instagram: "@bandaejemplo",
    },
  });

  // --- Reserva de ejemplo (hoy, 2 horas) ---
  const inicio = new Date();
  inicio.setHours(19, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setHours(21, 0, 0, 0);

  await prisma.reserva.upsert({
    where: { id: "reserva-demo" },
    update: {},
    create: {
      id: "reserva-demo",
      bandaId: banda.id,
      inicio,
      fin,
      estado: "CONFIRMADA",
      transmitirEnVivo: true,
      precio: 15000,
    },
  });

  // --- Equipos de ejemplo ---
  // SQLite no soporta skipDuplicates en createMany, así que usamos upsert.
  const equipos = [
    { id: "equipo-bateria", nombre: "Batería Pearl Export", categoria: "Percusión" },
    { id: "equipo-ampli-bajo", nombre: "Amplificador de bajo Ampeg", categoria: "Amplificación" },
    { id: "equipo-mic-sm58", nombre: "Micrófono Shure SM58 (x4)", categoria: "Audio" },
  ];
  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { id: equipo.id },
      update: {},
      create: equipo,
    });
  }

  console.log("Seed completo.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
