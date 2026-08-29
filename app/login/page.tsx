"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido"
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória"
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Mock login success
    toast({
      title: "Login realizado com sucesso!",
      description: "Redirecionando para o dashboard...",
    })

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center mb-6">
            <Wine className="h-8 w-8 text-wine-600" />
            <h1 className="text-2xl font-bold text-wine-700 ml-2">LEWET</h1>
          </Link>
          <h2 className="text-2xl font-bold text-center text-gray-800">Bem-vindo de volta</h2>
          <p className="text-gray-600 mt-1">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="text-sm text-wine-600 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Lembrar-me
            </Label>
          </div>

          <Button type="submit" className="w-full bg-wine-600 hover:bg-wine-700">
            Entrar
          </Button>

          <p className="text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-wine-600 hover:underline">
              Registre-se
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
