"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { useSidebar } from "@/components/sidebar-provider"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar()
  const [isMounted, setIsMounted] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  // Hydration fix
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 border-b bg-white">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex-1 md:ml-16">
            <h1 className="text-xl font-semibold text-gray-800">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/dashboard/restaurants" && "Restaurantes"}
              {pathname === "/dashboard/payments" && "Pagamentos"}
              {pathname === "/dashboard/exercises" && "Exercícios"}
              {pathname === "/dashboard/profile" && "Perfil"}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
