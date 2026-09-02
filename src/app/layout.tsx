import type { Metadata } from "next";
import { Oswald, Manrope } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cuartel del Músico — En Vivo",
  description:
    "Streaming en vivo de bandas de Concepción desde la sala de ensayo Cuartel del Músico.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-neutral-100">
        {children}
      </body>
    </html>
  );
}
