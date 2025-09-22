
import "./globals.css";
export const metadata = { title: "CRON | Demo", description: "Login con cápsula y flujo asesor" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] antialiased">
        {children}
      </body>
    </html>
  );
}
