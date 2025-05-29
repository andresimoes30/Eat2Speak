import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wine } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-2">
            <Wine className="h-12 w-12 text-wine-600" />
            <h1 className="text-4xl font-bold text-wine-700 ml-2">LEWET</h1>
          </div>
          <p className="text-lg text-purple-800 font-medium">Aprenda idiomas enquanto desfruta de comida deliciosa</p>
        </div>

        <div className="space-y-4 w-full">
          <Button asChild className="w-full bg-wine-600 hover:bg-wine-700">
            <Link href="/login">Login</Link>
          </Button>

          <div className="grid grid-cols-3 gap-3">
            <Button asChild variant="outline" className="border-gold-500 text-gold-700 hover:bg-gold-50">
              <Link href="/register?type=student">Estudante</Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-500 text-purple-700 hover:bg-purple-50">
              <Link href="/register?type=teacher">Professor</Link>
            </Button>
            <Button asChild variant="outline" className="border-wine-500 text-wine-700 hover:bg-wine-50">
              <Link href="/register?type=restaurant">Restaurante</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
