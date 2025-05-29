"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RestaurantCard } from "@/components/restaurant-card"
import { RestaurantMap } from "@/components/restaurant-map"
import { Search, SlidersHorizontal } from "lucide-react"

// Mock data for restaurants
const restaurants = [
  {
    id: 1,
    name: "La Pasta Italiana",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Italiana",
    price: "$$",
    rating: 4.7,
    location: "Rua Augusta, 1200",
    languages: ["Italiano", "Inglês"],
  },
  {
    id: 2,
    name: "Sushi Koi",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Japonesa",
    price: "$$$",
    rating: 4.9,
    location: "Alameda Santos, 800",
    languages: ["Japonês", "Inglês"],
  },
  {
    id: 3,
    name: "Le Bistrot",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Francesa",
    price: "$$$",
    rating: 4.6,
    location: "Rua Oscar Freire, 500",
    languages: ["Francês", "Inglês"],
  },
  {
    id: 4,
    name: "Tapas & Vino",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Espanhola",
    price: "$$",
    rating: 4.5,
    location: "Rua dos Pinheiros, 300",
    languages: ["Espanhol", "Inglês"],
  },
  {
    id: 5,
    name: "Biergarten",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Alemã",
    price: "$$",
    rating: 4.4,
    location: "Av. Paulista, 1000",
    languages: ["Alemão", "Inglês"],
  },
  {
    id: 6,
    name: "Trattoria Napoli",
    image: "/placeholder.svg?height=200&width=300",
    cuisine: "Italiana",
    price: "$$",
    rating: 4.3,
    location: "Rua Amauri, 400",
    languages: ["Italiano", "Inglês"],
  },
]

export default function RestaurantsPage() {
  const [view, setView] = useState<"list" | "map">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState("")
  const [languageFilter, setLanguageFilter] = useState("")

  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPrice = priceFilter ? restaurant.price === priceFilter : true
    const matchesCuisine = cuisineFilter ? restaurant.cuisine === cuisineFilter : true
    const matchesLanguage = languageFilter ? restaurant.languages.includes(languageFilter) : true

    return matchesSearch && matchesPrice && matchesCuisine && matchesLanguage
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar restaurantes, cozinhas, locais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Filtros</span>
          </Button>

          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Preço</Label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger id="price">
                    <SelectValue placeholder="Qualquer preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer preço</SelectItem>
                    <SelectItem value="$">$ (Econômico)</SelectItem>
                    <SelectItem value="$">$ (Moderado)</SelectItem>
                    <SelectItem value="$$">$$ (Caro)</SelectItem>
                    <SelectItem value="$$">$$ (Luxuoso)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cuisine">Tipo de Cozinha</Label>
                <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                  <SelectTrigger id="cuisine">
                    <SelectValue placeholder="Todas as cozinhas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Todas as cozinhas</SelectItem>
                    <SelectItem value="Italiana">Italiana</SelectItem>
                    <SelectItem value="Japonesa">Japonesa</SelectItem>
                    <SelectItem value="Francesa">Francesa</SelectItem>
                    <SelectItem value="Espanhola">Espanhola</SelectItem>
                    <SelectItem value="Alemã">Alemã</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Todos os idiomas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Todos os idiomas</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Italiano">Italiano</SelectItem>
                    <SelectItem value="Japonês">Japonês</SelectItem>
                    <SelectItem value="Francês">Francês</SelectItem>
                    <SelectItem value="Espanhol">Espanhol</SelectItem>
                    <SelectItem value="Alemão">Alemão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        {view === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}

            {filteredRestaurants.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum restaurante encontrado com os filtros selecionados.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setPriceFilter("")
                    setCuisineFilter("")
                    setLanguageFilter("")
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        ) : (
          <RestaurantMap restaurants={filteredRestaurants} />
        )}
      </div>
    </div>
  )
}
