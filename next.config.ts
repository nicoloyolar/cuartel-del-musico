import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El hosting de producción (Hostinger, CloudLinux Node.js Selector vía
  // Passenger) espera un build standalone: una carpeta autocontenida con
  // todo lo necesario para correr `node server.js` sin `npm install` en el
  // servidor. Genera `.next/standalone/` — ver deploy.sh para el resto del
  // empaquetado (assets estáticos y `public/` no quedan incluidos solos,
  // hay que copiarlos aparte).
  output: "standalone",
};

export default nextConfig;
