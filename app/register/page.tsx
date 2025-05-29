"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GraduationCap, Store, User, Wine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const userTypes = [
  { id: "student", label: "Estudante", icon: User },
  { id: "teacher", label: "Professor", icon: GraduationCap },
  { id: "restaurant", label: "Restaurante", icon: Store },
]

const languages = [
  "Inglês",
  "Espanhol",
  "Francês",
  "Alemão",
  "Italiano",
  "Japonês",
  "Mandarim",
  "Português",
  "Russo",
  "Árabe",
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState(searchParams.get("type") || "student")
  const [nativeLanguage, setNativeLanguage] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const type = searchParams.get("type")
    if (type && ["student", "teacher", "restaurant"].includes(type)) {
      setUserType(type)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) newErrors.firstName = "Nome é obrigatório"
    if (!lastName.trim()) newErrors.lastName = "Sobrenome é obrigatório"
    if (!email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido"
    }
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório"
    if (!password) {
      newErrors.password = "Senha é obrigatória"
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }
    if (userType === "teacher" && !nativeLanguage) {
      newErrors.nativeLanguage = "Selecione seu idioma nativo"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Mock registration success
    toast({
      title: "Registro realizado com sucesso!",
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
          <h2 className="text-2xl font-bold text-center text-gray-800">Crie sua conta</h2>
          <p className="text-gray-600 mt-1">Junte-se à comunidade LEWET</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-3 gap-3 mb-6">
            {userTypes.map((type) => {
              const Icon = type.icon
              return (
                <div key={type.id} className="relative">
                  <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                  <Label
                    htmlFor={type.id}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        userType === type.id
                          ? "border-wine-500 bg-wine-50 text-wine-700"
                          : "border-gray-200 hover:border-gray-300"
                      }
                      peer-focus-visible:ring-2 peer-focus-visible:ring-wine-500 peer-focus-visible:ring-offset-2`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${userType === type.id ? "text-wine-600" : "text-gray-500"}`} />
                    <span>{type.label}</span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>
          </div>

          {userType === "teacher" && (
            <div className="space-y-2">
              <Label htmlFor="nativeLanguage">Idioma Nativo</Label>
              <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                <SelectTrigger id="nativeLanguage" className={errors.nativeLanguage ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione seu idioma nativo" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nativeLanguage && <p className="text-red-500 text-sm">{errors.nativeLanguage}</p>}
            </div>
          )}

          <Button type="submit" className="w-full bg-wine-600 hover:bg-wine-700">
            Registrar
          </Button>

          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-wine-600 hover:underline">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
