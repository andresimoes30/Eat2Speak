import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LEWET - Aprenda idiomas com experiências gastronômicas",
  description: "Plataforma que conecta estudantes de idiomas com professores em restaurantes locais",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
