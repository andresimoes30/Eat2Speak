"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, CreditCard, Home, LogOut, Store, User, Wine } from "lucide-react"

interface AppSidebarProps {
  isOpen: boolean
}

export function AppSidebar({ isOpen }: AppSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/dashboard/restaurants", label: "Restaurantes", icon: Store },
    { href: "/dashboard/payments", label: "Pagamentos", icon: CreditCard },
    { href: "/dashboard/exercises", label: "Exercícios", icon: BookOpen },
    { href: "/dashboard/profile", label: "Perfil", icon: User },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" aria-hidden="true" />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b">
            <Wine className="h-6 w-6 text-wine-600" />
            <h2 className="ml-2 text-xl font-bold text-wine-700">LEWET</h2>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                        isActive ? "bg-wine-50 text-wine-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-wine-600" : "text-gray-500"}`} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <Link
              href="/"
              className="flex items-center px-4 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Sair
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
